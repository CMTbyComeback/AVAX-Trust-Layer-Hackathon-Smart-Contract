# Security Policy

## Overview
The **Invariance Registry** is a security-sensitive smart contract designed to store trusted risk assessments for external contracts. We take security, responsible disclosure, and upgrade transparency seriously. This document outlines how vulnerabilities should be reported and what is considered in-scope.

---

## Reporting a Vulnerability

If you discover a security issue, **do not open a public GitHub issue**.

Instead, please report privately via:

- Email: `security@yourdomain.com`
- Encrypted channel (optional PGP key TBD)

We aim to acknowledge issues within **72 hours**.

When reporting, please include:

- A short description of the issue
- Steps to reproduce
- Potential impact
- Any known affected deployments
- Suggested fix (if possible)

---

## Scope

### In Scope
- Implementation flaws
- Missing access control
- Upgradeability vulnerabilities
- Data corruption or loss of integrity
- Incorrect risk reporting logic
- DoS vectors
- Economic or incentive vulnerabilities
- Role escalation
- Unauthorized access to analysis data

### Out of Scope
- Issues requiring root or admin compromise of the reporter's machine
- Issues arising from modified or unofficial deployments
- UI-only issues outside this repository
- Theoretical attacks without practical impact

---

## Responsible Disclosure Policy

We ask researchers to:

- Provide reasonable time (14–45 days) for remediation before public disclosure
- Avoid actively targeting users or causing real damage
- Not exploit the vulnerability beyond what is required for proof

In return:

- We will credit valid researchers unless anonymity is requested
- We will work transparently on patches

---

## Upgradeability Considerations

This contract uses **UUPS (EIP-1822)** upgradeability.

Security implications to be aware of:

- The upgrade function is restricted to `DEFAULT_ADMIN_ROLE`
- Storage gaps exist to prevent layout collision in future versions
- All upgrades will be documented in `CHANGELOG.md`

If you discover:

- Storage layout collisions
- Upgrade path vulnerabilities
- Proxy takeover risk  
…please report immediately.

---

## Reporting Bounties (Optional)

If you intend to integrate a bounty program later, add something like:

> Qualifying vulnerability reports may be eligible for rewards at our discretion, based on severity and impact.

If not, simply omit the bounty section.

---

## Final Notes

We appreciate community contributions that make this system safer.  
If in doubt, always disclose privately first — we will guide you from there.
