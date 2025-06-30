// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Token} from "./Token.sol";

contract Factory {
    address public owner; //developer of factory
    uint256 public immutable fee;
    uint256 private totalFeesCollected;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public constant TARGET = 3 ether;

    address[] public tokens;
    uint256 public totalTokens;

    struct TokenSale{
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }
    mapping(address => TokenSale) public tokenToSale;


    event TokenCreated(address indexed creator, address indexed token, string name, string symbol, uint256 totalSupply);
    event Buy(address indexed token, uint256 amount);

    modifier onlyOwner(){
        require(msg.sender == owner, "Factory: Only owner can perform this action");
        _;
    }

    constructor(uint256 _fee){
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name, string memory _symbol) external payable {
        //make sure fee is correct
        require(msg.value >= fee, "Factory: Creator fee not met");
        totalFeesCollected += msg.value;

        //  create a new token
        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        // save the token for later use
        tokens.push(address(token));
        totalTokens += 1;

        // list the token for sale
        TokenSale memory sale = TokenSale({
            token: address(token),
            name: _name,
            creator: msg.sender,
            sold: 0,
            raised: 0,
            isOpen: true
        });

        tokenToSale[address(token)] = sale;

        
        // tell people it's live(events)
        emit TokenCreated(msg.sender, address(token), _name, _symbol, 100 ether);

        
    }

    function getTokenSale(uint256 _index) public view returns (TokenSale memory){
        return tokenToSale[address(tokens[_index])];
    }

    function getCost(uint256 _sold) public pure returns (uint256){
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;

    }

    function buyToken(address _token, uint256 _amount) external payable{
        TokenSale storage sale = tokenToSale[_token];
        //check conditions
        require(sale.isOpen == true, "Factory: Token sale is closed");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        //check calculations
        uint256 cost = getCost(sale.sold);  //cost of 1 token based on bought
        uint256 price = cost * (_amount / 10 ** 18);

        //make sure enough eth is sent
        require(msg.value >= price, "Factory: Insuffiecient ETH received");


        //update the sale and raised ether
        sale.raised += price;
        sale.sold += _amount;

        //make sure fund raising goal is met
         if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, _amount);

    }

    function deposit(address _token) external{
        // The remaining token balance and the ETH raised
        // would go into a liquidity pool like Uniswap V3.
        // For simplicity we'll just transfer remaining
        // tokens and ETH raised to the creator.

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: Target not reached");
        //transfer rem token from factory to creator
        token.transfer(sale.creator, token.balanceOf(address(this)));  

        //transfer ETH raised
        (bool success,) = payable(sale.creator).call{value : sale.raised}("");
        require(success, "Factory: ETH transfer failed");

    }

    function withdrawFee(uint256 _amount) external onlyOwner{

        //check amount requested is less than or equal to fee
        require(_amount <= totalFeesCollected, "Factory: Amount exceeds fee");
        totalFeesCollected -= _amount;

        (bool success, ) = payable(owner).call{value : _amount}("");
        require(success, "Factory: Fee transfer failed");

    }
}
