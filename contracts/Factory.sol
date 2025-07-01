// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Token} from "./Token.sol";

contract Factory {
    address public owner; //developer of factory contract
    uint256 public immutable fee;
    uint256 private totalFeesCollected;
    

    address[] public tokens;
    uint256 public totalTokens;

    struct TokenSale{
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
        bool amountWithdrawn;
        uint256 tokenLimit;
        uint256 targetRaise;
        string metadataURI;
    }
    mapping(address => TokenSale) public tokenToSale;


    event TokenCreated(address indexed creator, address indexed token, string name, string symbol, uint256 totalSupply);
    event Buy(address indexed token, address indexed buyer, uint256 amount, uint256 price);
    event Deposited(address indexed token, uint256 ethAmount, uint256 tokenAmount);
    event FeeWithdrawn(address indexed owner, uint256 amount);


    modifier onlyOwner(){
        require(msg.sender == owner, "Factory: Only owner can perform this action");
        _;
    }

    constructor(uint256 _fee){
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name, string memory _symbol, uint256 _totalSupply, uint256 _targetRaise, string memory _metadata) external payable {
        //make sure fee is correct
        require(msg.value >= fee, "Factory: Creator fee not met");
        require(_totalSupply > 0, "Factory: Invalid total supply");
        require(_targetRaise > 0, "Factory: Invalid raise target");

        totalFeesCollected += msg.value;

        //  create a new token
        Token token = new Token(msg.sender, _name, _symbol, _totalSupply);

        // save the token for later use
        tokens.push(address(token));
        totalTokens++;

        // list the token for sale
        TokenSale memory sale = TokenSale({
            token: address(token),
            name: _name,
            creator: msg.sender,
            sold: 0,
            raised: 0,
            isOpen: true,
            amountWithdrawn : false,
            tokenLimit : _totalSupply / 2,
            targetRaise : _targetRaise,
            metadataURI : _metadata
        });

        tokenToSale[address(token)] = sale;

        // tell people it's live(events)
        emit TokenCreated(msg.sender, address(token), _name, _symbol, _totalSupply);

        
    }

    function getTokenSale(uint256 _index) public view returns (TokenSale memory){
        return tokenToSale[address(tokens[_index])];
    }

    function getCost(uint256 _sold) public pure returns (uint256){
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;

    }

    function buyToken(address _token, uint256 _amount) external payable{
        TokenSale storage sale = tokenToSale[_token];

        //check conditions
        require(sale.isOpen == true, "Factory: Token sale is closed");
        require(_amount <= sale.tokenLimit, "Factory: Token amount exceeded");

        //check calculations
        uint256 costPerToken = getCost(sale.sold);  
        uint256 price = costPerToken * (_amount / 1 ether);

        //make sure enough eth is sent
        require(msg.value >= price, "Factory: Insuffiecient ETH received");


        //update the sale and raised ether
        sale.raised += price;
        sale.sold += _amount;

        //make sure fund raising goal is met
         if (sale.sold >= sale.tokenLimit || sale.raised >= sale.targetRaise) {
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, msg.sender, _amount, price);

    }

    function deposit(address _token) external{
        // The remaining token balance and the ETH raised
        // would go into a liquidity pool like Uniswap V3.
        // For simplicity we'll just transfer remaining
        // tokens and ETH raised to the creator.

        
        TokenSale storage sale = tokenToSale[_token];

        require(msg.sender == sale.creator, "Factory: Not token creator");
        require(sale.isOpen == false, "Factory: Target not reached");
        require(sale.amountWithdrawn == false, "Factory: Already withdrawn");
        require(sale.raised > 0, "Factory: Nothing to deposit");

        //transfer rem token and ETH from factory to creator
        uint256 tokenAmount = Token(_token).balanceOf(address(this));
        uint256 ethAmount = sale.raised;

        Token(_token).transfer(sale.creator, tokenAmount);  
        (bool success,) = payable(sale.creator).call{value : ethAmount}("");
        require(success, "Factory: ETH transfer failed");

        sale.amountWithdrawn = true;
        emit Deposited(_token, ethAmount, tokenAmount);

    }

    function withdrawFee(uint256 _amount) external onlyOwner{

        //check amount requested is less than or equal to fee
        require(_amount <= totalFeesCollected, "Factory: Amount exceeds fee");
        totalFeesCollected -= _amount;

        (bool success, ) = payable(owner).call{value : _amount}("");
        require(success, "Factory: Fee transfer failed");

        emit FeeWithdrawn(owner, _amount);

    }
}
