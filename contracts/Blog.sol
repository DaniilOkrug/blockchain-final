// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Blog {
    struct Article {
        string title;
        string content;
        address payable author;
        uint price;
        address token;
        uint ethPrice;
        uint createdAt;
    }

    uint private articleIndex = 0;
    address private admin = 0xF290AFD9f301d145D4398bB1afd7166AB8a81271;

    mapping(uint => Article) private articles;
    mapping(address => mapping(uint => bool)) public accessGranted;

    event CreateArticle(uint id, address owner);
    event AccessGranted(uint id, address recipient);

    modifier onlyAdmin {
        require(msg.sender == admin);
        _;
    }

    constructor() {}

    function createArticle(
        string memory title, 
        string memory content,
        uint price,
        address token,
        uint ethPrice
    ) external {
        require(price >= 0, "Wrong token price");
        require(ethPrice >= 0, "Wrong eth price");

        articles[articleIndex] = Article({
            title: title,
            content: content,
            author: payable(msg.sender),
            price: price,
            token: token,
            ethPrice: ethPrice,
            createdAt: block.timestamp
        });

        emit CreateArticle(articleIndex, msg.sender);

        accessGranted[msg.sender][articleIndex] = true;

        articleIndex += 1;
    }

    /* Buy with native blockchain token */
    function buyAccess(uint index) public payable {
        require(index >= 0 && index < articleIndex, "Article doesn't exists");
        require(!accessGranted[msg.sender][index], "Access alredy granted");
        
        Article storage article = articles[index];
        require(msg.value >= article.price, "Wrong transfer amount");

        if (article.ethPrice > 0) {
            article.author.transfer(article.price);
        }

        accessGranted[msg.sender][index] = true;

        emit AccessGranted(index, msg.sender);
    }

    /* Buy with stablecoin of the article */
    function buyAccessWithToken(uint index) external {
        require(index >= 0 && index < articleIndex, "Article doesn't exists");
        require(!accessGranted[msg.sender][index], "Access alredy granted");

        Article storage article = articles[index];

        if (article.price > 0) {
            IERC20 tokenPayment = IERC20(article.token);
            tokenPayment.transferFrom(msg.sender, article.author, article.price);
        }

        accessGranted[msg.sender][index] = true;

        emit AccessGranted(index, msg.sender);
    }

    function readArticle(uint index) external  view returns (
        string memory title,
        string memory content,
        uint createdAt
    ) {
        require(index >= 0 && index < articleIndex, "Article doesn't exists");
        require(accessGranted[msg.sender][index], "Access not granted");

        Article storage article = articles[index];

        return (article.title, article.content, article.createdAt);
    }

    function getArticle(uint index) external view returns (
        uint id,
        string memory title,
        uint price,
        address tokenAddress,
        uint ethPrice,
        uint createdAt,
        address author,
        bool hasAccess
    ) {
        require(index >= 0 && index < articleIndex, "Article doesn't exists");
        Article storage article = articles[index];
        bool isAccessGranted = accessGranted[msg.sender][index];

        return (
            index,
            article.title,
            article.price,
            article.token,
            article.ethPrice,
            article.createdAt,
            article.author,
            isAccessGranted
        );
    }

    function getArticlesLength() public  view returns (uint) {
        return articleIndex;
    }

    function _getArticle(uint index) onlyAdmin external view returns (
        string memory title,
        string memory content,
        address owner,
        uint price,
        address token,
        uint ethPrice,
        uint createdAt
    ) {
        Article storage article = articles[index];

        return (
            article.title,
            article.content,
            article.author,
            article.price,
            article.token,
            article.ethPrice,
            article.createdAt
        );
    }

    function _createArticle(
        uint index,
        string memory title, 
        string memory content, 
        address author, 
        uint price,
        address token,
        uint ethPrice,
        uint createdAt
    ) onlyAdmin external  {
        articles[index] = Article({
            title: title,
            content: content,
            author: payable(author),
            price: price,
            token: token,
            ethPrice: ethPrice,
            createdAt: createdAt
        });

        accessGranted[author][index] = true;
        articleIndex = index + 1;
    }

    function _grantAccess(uint index, address buyer) onlyAdmin external {
        accessGranted[buyer][index] = true;
    }
}
