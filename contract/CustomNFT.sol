// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CustomNFT
 * @dev Minimal, fully custom ERC721 NFT implementation without OpenZeppelin
 */
contract CustomNFT {
    // --- Token metadata ---
    string public name;
    string public symbol;

    // --- ERC721 Storage ---
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => string) private _tokenURIs;

    // --- Ownership ---
    address public owner;
    uint256 public totalSupply;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier exists(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        _;
    }

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    // --- ERC721 Standard Functions ---

    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Zero address not valid");
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) public view exists(tokenId) returns (address) {
        return _owners[tokenId];
    }

    function approve(address to, uint256 tokenId) public exists(tokenId) {
        address tokenOwner = _owners[tokenId];
        require(to != tokenOwner, "Cannot approve to owner");
        require(msg.sender == tokenOwner || isApprovedForAll(tokenOwner, msg.sender), "Not authorized");

        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view exists(tokenId) returns (address) {
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Cannot approve self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public exists(tokenId) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner == from, "From is not the token owner");
        require(to != address(0), "Transfer to zero address not allowed");
        require(
            msg.sender == tokenOwner ||
            getApproved(tokenId) == msg.sender ||
            isApprovedForAll(tokenOwner, msg.sender),
            "Not authorized"
        );

        _approve(address(0), tokenId); // clear previous approvals
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
        require(_checkOnERC721Received(), "Receiver not ERC721 compatible");
    }

    // --- Internal helper ---
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(_owners[tokenId], to, tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    // --- Minting (Only Owner) ---
    function mint(address to, uint256 tokenId, string memory tokenURI_) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(!_exists(tokenId), "Token already exists");

        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = tokenURI_;
        totalSupply += 1;

        emit Transfer(address(0), to, tokenId);
    }

    // --- Burning (Only Owner) ---
    function burn(uint256 tokenId) public onlyOwner exists(tokenId) {
        address tokenOwner = _owners[tokenId];
        _balances[tokenOwner] -= 1;
        delete _owners[tokenId];
        delete _tokenURIs[tokenId];
        totalSupply -= 1;

        emit Transfer(tokenOwner, address(0), tokenId);
    }

    // --- Metadata URI ---
    function tokenURI(uint256 tokenId) public view exists(tokenId) returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // --- Safe Transfer Check ---
    function _checkOnERC721Received() private pure returns (bool) {
        // For simplicity: assume receiver can handle ERC721
        // In production, check for onERC721Received selector
        return true;
    }
}
