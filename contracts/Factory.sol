// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Token} from "./Token.sol";

contract Factory {
    address public owner; //developer of factory
    uint256 public immutable fee;

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

    constructor(uint256 _fee){
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name, string memory _symbol) external payable {
        //make sure fee is correct
        require(msg.value >= fee, "fee is not sufficient");
        //  create a new token
        Token token = new Token(msg.sender, _name, _symbol, 100 ether);

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



        
        //Tell people it's live
        
    }

    function getTokenSale(uint256 _index) public view returns (TokenSale memory){
        return tokenToSale[address(tokens[_index])];
    }
}
