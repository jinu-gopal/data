/**
 * ============================================================================
 * MAX-ERP Security, RBAC, User Management & Integration Governance Test Suite
 * ============================================================================
 *
 * Verifies all 9 pillars of the MAX ERP Security & Governance Suite:
 *  1. Security Studio Web Route Health (/security)
 *  2. Real-Time Security Health & Telemetry Metrics
 *  3. Immutable Audit Trail & Compliance Search Engine
 *  4. Active Session Governance & Token Revocation
 *  5. RBAC Dynamic Matrix Studio & Permission Toggling
 *  6. Multi-Tenant Architecture & Organization Mappings
 *  7. Enterprise User Management & Role Provisioning (/users)
 *  8. Enterprise Integration Hub (Clients, Webhooks, Ping, Connectors)
 *  9. Data Pipeline Studio & ETL Telemetry (/configuration/data-pipeline)
 * ============================================================================
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

let passedCount = 0;
let failedCount = 0;

function logPass(title, details) {
  passedCount++;
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${colors.bright}${title}${colors.reset}`);
  if (details) console.log(`         ${colors.dim}${details}${colors.reset}`);
}

function logFail(title, error) {
  failedCount++;
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${colors.bright}${title}${colors.reset}`);
  console.log(`         ${colors.red}${error}${colors.reset}`);
}

async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}================================================================================`);
  console.log(`MAX-ERP Security, RBAC & Integration Governance Verification Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`================================================================================${colors.reset}\n`);

  // --------------------------------------------------------------------------
  // PILLAR 1: Web Route Availability
  // --------------------------------------------------------------------------
  console.log(`${colors.bright}▶ PILLAR 1: Web Route Availability & Shell Mount${colors.reset}`);
  try {
    const resSec = await fetch(`${BASE_URL}/security`);
    if (resSec.status === 200) {
      logPass("Security & Governance Studio Web Route (/security)", "Status: 200 OK | Shell Mounted");
    } else {
      logFail("Security & Governance Studio Web Route (/security)", `Status: ${resSec.status}`);
    }

    const resUsers = await fetch(`${BASE_URL}/users`);
    if (resUsers.status === 200) {
      logPass("User Access & RBAC Directory Route (/users)", "Status: 200 OK | Shell Mounted");
    } else {
      logFail("User Access & RBAC Directory Route (/users)", `Status: ${resUsers.status}`);
    }

    const resInteg = await fetch(`${BASE_URL}/integrations`);
    if (resInteg.status === 200) {
      logPass("Enterprise Integration Hub Route (/integrations)", "Status: 200 OK | Shell Mounted");
    } else {
      logFail("Enterprise Integration Hub Route (/integrations)", `Status: ${resInteg.status}`);
    }
  } catch (err) {
    logFail("Web Route Availability Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 2: Security Dashboard Telemetry
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 2: Real-Time Security Health & Telemetry Metrics${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/security/dashboard`);
    if (res.ok) {
      const metrics = await res.json();
      if (typeof metrics.healthScore === 'number' && metrics.healthScore >= 90) {
        logPass("Security Health Score Telemetry", `Health Score: ${metrics.healthScore}% | MFA Adoption: ${metrics.mfaEnabledPercent}%`);
      } else {
        logFail("Security Health Score Telemetry", `Invalid health score: ${metrics.healthScore}`);
      }

      if (metrics.totalRolesCount > 0 && metrics.totalPermissionsCount > 0) {
        logPass("Security Entities Headcount Telemetry", `Roles: ${metrics.totalRolesCount} | Permissions: ${metrics.totalPermissionsCount} | Users: ${metrics.totalUsersCount}`);
      } else {
        logFail("Security Entities Headcount Telemetry", "Roles or permissions count is zero.");
      }
    } else {
      logFail("Fetch Security Dashboard", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Security Dashboard Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 3: Immutable Audit Trail & Compliance Search Engine
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 3: Immutable Audit Trail & Compliance Search Engine${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/security/audit-trail?category=ALL&limit=20`);
    if (res.ok) {
      const events = await res.json();
      if (Array.isArray(events) && events.length > 0) {
        logPass("Unified Audit Trail Feed Retrieval", `Retrieved ${events.length} immutable compliance events`);
      } else {
        logFail("Unified Audit Trail Feed Retrieval", "No audit events returned.");
      }

      // Test Category Filtering
      const authRes = await fetch(`${BASE_URL}/api/security/audit-trail?category=AUTH`);
      const authEvents = await authRes.json();
      const allAuth = authEvents.every((e) => e.category === 'AUTH');
      if (allAuth && authEvents.length > 0) {
        logPass("Audit Trail Category Isolation (AUTH)", `Filtered ${authEvents.length} authentication events`);
      } else {
        logFail("Audit Trail Category Isolation (AUTH)", "Category filter returned invalid records.");
      }
    } else {
      logFail("Audit Trail API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Audit Trail Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 4: Active Session Governance & Token Revocation
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 4: Active Session Governance & Token Revocation${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/security/sessions`);
    if (res.ok) {
      const sessions = await res.json();
      if (Array.isArray(sessions) && sessions.length > 0) {
        logPass("Active OAuth2 Session Enumeration", `Discovered ${sessions.length} live sessions | Top Principal: ${sessions[0].principalName}`);
      } else {
        logFail("Active OAuth2 Session Enumeration", "No active sessions found.");
      }

      // Test Session Termination
      const targetSession = sessions[0];
      if (targetSession) {
        const termRes = await fetch(`${BASE_URL}/api/security/sessions/${targetSession.id}`, {
          method: 'DELETE',
        });
        if (termRes.ok) {
          logPass("Forceful Session Token Revocation", `Session ${targetSession.id} successfully terminated.`);
        } else {
          logFail("Forceful Session Token Revocation", `Status: ${termRes.status}`);
        }
      }
    } else {
      logFail("Active Sessions API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Session Governance Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 5: RBAC Dynamic Matrix Studio & Permission Toggling
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 5: RBAC Dynamic Matrix Studio & Permission Toggling${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/security/matrix`);
    if (res.ok) {
      const matrix = await res.json();
      if (matrix.roles && matrix.permissions && matrix.rolePermissionMap) {
        logPass("RBAC Cross-Matrix Structure", `Roles: ${matrix.roles.length} | Permissions: ${matrix.permissions.length} | Mapped Roles: ${Object.keys(matrix.rolePermissionMap).length}`);
      } else {
        logFail("RBAC Cross-Matrix Structure", "Invalid matrix payload structure.");
      }

      // Test Permission Toggle Grant
      const testRole = matrix.roles[0];
      const testPerm = matrix.permissions[0];
      if (testRole && testPerm) {
        const toggleRes = await fetch(`${BASE_URL}/api/security/matrix/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roleId: testRole.id,
            permissionId: testPerm.id,
            grant: true,
          }),
        });

        if (toggleRes.ok) {
          logPass("Dynamic Permission Grant Modification", `Granted ${testPerm.permissionKey} on ${testRole.name}`);
        } else {
          logFail("Dynamic Permission Grant Modification", `Status: ${toggleRes.status}`);
        }
      }
    } else {
      logFail("RBAC Matrix API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("RBAC Matrix Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 6: Multi-Tenant Architecture & Organization Mappings
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 6: Multi-Tenant Architecture & Organization Mappings${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/tenants`);
    if (res.ok) {
      const tenants = await res.json();
      if (Array.isArray(tenants) && tenants.length >= 2) {
        logPass("Multi-Tenant Isolation Registry", `Active Tenants: ${tenants.map((t) => t.tenantKey).join(', ')}`);
      } else {
        logFail("Multi-Tenant Isolation Registry", "Insufficient tenant records.");
      }

      // Fetch organizations under first tenant
      const firstTenant = tenants[0];
      const orgsRes = await fetch(`${BASE_URL}/api/tenants/${firstTenant.id}/organizations`);
      if (orgsRes.ok) {
        const orgs = await orgsRes.json();
        logPass("Tenant Organization Topology Rollup", `Tenant [${firstTenant.tenantKey}] has ${orgs.length} assigned organizations`);
      } else {
        logFail("Tenant Organization Topology Rollup", `Status: ${orgsRes.status}`);
      }
    } else {
      logFail("Tenants API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Tenant Architecture Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 7: Enterprise User Management & Role Provisioning
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 7: Enterprise User Management & Role Provisioning (/users)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/users`);
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users) && users.length >= 3) {
        logPass("Enterprise User Directory Dossier", `Total Users: ${users.length} | Sample: ${users.slice(0, 3).map((u) => u.username).join(', ')}`);
      } else {
        logFail("Enterprise User Directory Dossier", "Insufficient users returned.");
      }

      // Create new user test
      const testUserPayload = {
        username: `alex.dev.${Date.now().toString().slice(-4)}`,
        email: `alex.dev.${Date.now()}@max-enterprise.com`,
        password: 'Password@123',
      };

      const createRes = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserPayload),
      });

      if (createRes.ok) {
        const createdUser = await createRes.json();
        logPass("Dynamic User Dossier Creation", `Created user: ${createdUser.username} (${createdUser.email})`);

        // Assign role to newly created user
        const assignRes = await fetch(`${BASE_URL}/api/users/${createdUser.id}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roleId: 'role-sec-03',
            tenantId: '00000000-0000-0000-0000-000000000001',
          }),
        });

        if (assignRes.ok) {
          logPass("Role Assignment to User Dossier", `Assigned ROLE_RECRUITING_MANAGER to ${createdUser.username}`);
        } else {
          logFail("Role Assignment to User Dossier", `Status: ${assignRes.status}`);
        }

        // Revoke role
        const revokeRes = await fetch(`${BASE_URL}/api/users/${createdUser.id}/roles/role-sec-03`, {
          method: 'DELETE',
        });
        if (revokeRes.ok) {
          logPass("Role Revocation from User Dossier", `Revoked role from ${createdUser.username}`);
        } else {
          logFail("Role Revocation from User Dossier", `Status: ${revokeRes.status}`);
        }
      } else {
        logFail("Dynamic User Dossier Creation", `Status: ${createRes.status}`);
      }
    } else {
      logFail("Users API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("User Management Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 8: Enterprise Integration Hub (Clients, Webhooks, Connectors)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 8: Enterprise Integration Hub Studio (/integrations)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/integrations/summary`);
    if (res.ok) {
      const summary = await res.json();
      if (summary.totalClientsCount > 0 && summary.totalWebhooksCount > 0) {
        logPass("Integration Hub Aggregated Summary", `Clients: ${summary.totalClientsCount} | Webhooks: ${summary.totalWebhooksCount} | Connectors: ${summary.activeConnectorsCount}`);
      } else {
        logFail("Integration Hub Aggregated Summary", "Summary counts are zero.");
      }

      // Provision new OAuth2 Client
      const clientPayload = {
        clientId: `client-test-${Date.now().toString().slice(-4)}`,
        clientName: "Automated Verification Test Client",
        grantTypes: ["client_credentials"],
        scopes: ["read", "write", "sync"],
      };

      const clientRes = await fetch(`${BASE_URL}/api/integrations/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload),
      });

      if (clientRes.ok) {
        const createdClient = await clientRes.json();
        logPass("OAuth2 API Client Provisioning", `Client ID: ${createdClient.clientId} | Status: ${createdClient.status}`);

        // Clean up client
        await fetch(`${BASE_URL}/api/integrations/clients/${createdClient.id}`, { method: 'DELETE' });
      } else {
        logFail("OAuth2 API Client Provisioning", `Status: ${clientRes.status}`);
      }

      // Create Webhook Subscription
      const webhookPayload = {
        name: "Security SOC Alert Dispatcher",
        targetUrl: "https://soc.max-enterprise.com/webhooks/security",
        events: ["security.token_revoked", "workflow.approved"],
      };

      const whRes = await fetch(`${BASE_URL}/api/integrations/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (whRes.ok) {
        const createdWh = await whRes.json();
        logPass("Webhook Subscription Registration", `Webhook: "${createdWh.name}" | Events: [${createdWh.events.join(', ')}]`);

        // Test Live Webhook Ping Delivery
        const pingRes = await fetch(`${BASE_URL}/api/integrations/webhooks/${createdWh.id}/test`, {
          method: 'POST',
        });
        if (pingRes.ok) {
          const pingLog = await pingRes.json();
          logPass("Live Webhook Ping Dispatch & Latency", `Status: ${pingLog.statusCode} OK | Latency: ${pingLog.latencyMs}ms | Success: ${pingLog.success}`);
        } else {
          logFail("Live Webhook Ping Dispatch & Latency", `Status: ${pingRes.status}`);
        }

        // Clean up webhook
        await fetch(`${BASE_URL}/api/integrations/webhooks/${createdWh.id}`, { method: 'DELETE' });
      } else {
        logFail("Webhook Subscription Registration", `Status: ${whRes.status}`);
      }

      // Toggle Connector Status
      const toggleConnRes = await fetch(`${BASE_URL}/api/integrations/connectors/conn-salesforce/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: true }),
      });
      if (toggleConnRes.ok) {
        const updatedConn = await toggleConnRes.json();
        logPass("Enterprise ERP Connector Toggle", `Connector "${updatedConn.name}" Status: ${updatedConn.status}`);
      } else {
        logFail("Enterprise ERP Connector Toggle", `Status: ${toggleConnRes.status}`);
      }
    } else {
      logFail("Integrations Summary API", `Status: ${res.status}`);
    }
  } catch (err) {
    logFail("Enterprise Integration Hub Check", err.message);
  }

  // --------------------------------------------------------------------------
  // PILLAR 9: Data Pipeline Studio & ETL Telemetry
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}▶ PILLAR 9: Data Pipeline Studio & ETL Telemetry (/configuration/data-pipeline)${colors.reset}`);
  try {
    const [resMet, resJobs] = await Promise.all([
      fetch(`${BASE_URL}/api/configuration/data-pipeline/metrics`),
      fetch(`${BASE_URL}/api/configuration/data-pipeline/jobs`),
    ]);

    if (resMet.ok && resJobs.ok) {
      const metrics = await resMet.json();
      const jobs = await resJobs.json();
      if (metrics.totalRowsProcessed > 0 && Array.isArray(jobs) && jobs.length > 0) {
        logPass("ETL Ingestion Telemetry & Success Rate", `Total Processed: ${metrics.totalRowsProcessed.toLocaleString()} rows | Success Rate: ${metrics.successRatePercent}%`);
        logPass("Batch Ingestion Jobs Registry", `Active/Completed Jobs: ${jobs.length} | Latest File: ${jobs[0].fileName}`);
      } else {
        logFail("ETL Ingestion Telemetry & Success Rate", "Empty pipeline telemetry.");
      }
    } else {
      logFail("Data Pipeline API", `Metrics Status: ${resMet.status} | Jobs Status: ${resJobs.status}`);
    }
  } catch (err) {
    logFail("Data Pipeline Check", err.message);
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bright}================================================================================`);
  console.log(`SECURITY, RBAC & INTEGRATION GOVERNANCE TEST SUMMARY`);
  console.log(`================================================================================${colors.reset}`);
  console.log(`  Total Checks Executed : ${passedCount + failedCount}`);
  console.log(`  Passed Checks         : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed Checks         : ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  console.log(`  Health Status         : ${failedCount === 0 ? colors.bright + colors.green + '100% HEALTHY & READY FOR ENTERPRISE UAT' : colors.red + 'FAILURES DETECTED'}${colors.reset}`);
  console.log(`${colors.bright}================================================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
