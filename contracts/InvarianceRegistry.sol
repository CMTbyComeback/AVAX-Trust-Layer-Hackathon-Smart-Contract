// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title AVAX Trust Layer – Invariance Registry (Upgradable)
 * @notice Trusted registry of smart-contract risk assessments
 */
contract InvarianceRegistry is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    using EnumerableSet for EnumerableSet.AddressSet;

    /* ======================== ROLES ======================== */
    bytes32 public constant ANALYZER_ROLE = keccak256("ANALYZER_ROLE");
    bytes32 public constant CURATOR_ROLE  = keccak256("CURATOR_ROLE");

    /* ======================== CONSTANTS ======================== */
    uint256 public constant FRAUD_SURFACE_MAX = 1_000;
    uint8   public constant RISK_NOT_ANALYZED  = 255;
    uint256 private constant MAX_WARNINGS      = 20;        // safety cap

    /* ======================== STRUCTS ======================== */
    struct Warning {
        string category;   // e.g. "UPGRADABLE", "HONEYPOT", "MINT"
        string message;
        string reference;  // optional URL
    }

    struct ContractAnalysis {
        uint256 fraudSurface;   // 0-1000
        uint8   riskLevel;      // 0=SAFE, 1=BOUNDED, 2=DECEPTIVE, 3=CATASTROPHIC
        uint40  lastUpdated;
        uint16  warningCount;
        bool    exists;
    }

    /* ======================== STORAGE ======================== */
    mapping(address => ContractAnalysis) private _analyses;
    mapping(address => Warning[])        private _warnings;
    EnumerableSet.AddressSet private _analyzedContracts;

    /* ------- gap for future variables (50 slots) ------- */
    uint256[50] private __gap;

    /* ======================== EVENTS ======================== */
    event ContractAnalyzed(
        address indexed contractAddress,
        uint256 fraudSurface,
        uint8   riskLevel,
        uint256 timestamp,
        address indexed analyzer
    );
    event HighRiskDetected(address indexed contractAddress, uint256 fraudSurface);
    event WarningsUpdated(address indexed contractAddress, uint256 count);

    /* ======================== INITIALIZER ======================== */
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize roles (admin/analyzer/curator) on deployment
     * @param initialAdmin address that receives DEFAULT_ADMIN_ROLE, ANALYZER_ROLE, CURATOR_ROLE
     */
    function initialize(address initialAdmin) public initializer {
        require(initialAdmin != address(0), "Zero admin");
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
