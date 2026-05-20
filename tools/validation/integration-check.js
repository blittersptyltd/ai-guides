#!/usr/bin/env node

/**
 * Validation script for Hermes + Codex integration
 * Checks prerequisites and runtime status
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

class IntegrationValidator {
  constructor() {
    this.results = {
      prerequisites: {},
      runtime: {},
      plugins: {},
      overall: 'unknown'
    };
  }

  async validateAll() {
    console.log('🔍 Validating Hermes + Codex Integration...\n');
    
    this.checkPrerequisites();
    this.checkRuntimeStatus();
    this.checkPluginAvailability();
    this.determineOverallStatus();
    
    this.printResults();
    
    return this.results.overall === 'ready';
  }

  checkPrerequisites() {
    console.log('📋 Checking Prerequisites...');
    
    // Check Codex CLI
    try {
      const version = execSync('codex --version', { encoding: 'utf8' }).trim();
      this.results.prerequisites.codexCLI = { 
        status: 'ok', 
        version,
        message: `Codex CLI ${version} installed` 
      };
      console.log(`  ✅ Codex CLI: ${version}`);
    } catch (error) {
      this.results.prerequisites.codexCLI = { 
        status: 'error', 
        message: 'Codex CLI not found. Install with: npm i -g @openai/codex' 
      };
      console.log('  ❌ Codex CLI: Not installed');
    }

    // Check Codex authentication
    try {
      execSync('codex auth status', { encoding: 'utf8', stdio: 'pipe' });
      this.results.prerequisites.codexAuth = { 
        status: 'ok', 
        message: 'Codex CLI authenticated' 
      };
      console.log('  ✅ Codex Auth: Logged in');
    } catch (error) {
      this.results.prerequisites.codexAuth = { 
        status: 'error', 
        message: 'Codex not authenticated. Run: codex login' 
      };
      console.log('  ❌ Codex Auth: Not logged in');
    }

    // Check Hermes config
    const configPath = path.join(os.homedir(), '.hermes', 'config.yaml');
    if (fs.existsSync(configPath)) {
      this.results.prerequisites.hermesConfig = { 
        status: 'ok', 
        message: 'Hermes configuration found' 
      };
      console.log('  ✅ Hermes Config: Found');
    } else {
      this.results.prerequisites.hermesConfig = { 
        status: 'error', 
        message: 'Hermes not configured. Run: hermes init' 
      };
      console.log('  ❌ Hermes Config: Not found');
    }
  }

  checkRuntimeStatus() {
    console.log('\n⚙️ Checking Runtime Status...');
    
    try {
      const configPath = path.join(os.homedir(), '.hermes', 'config.yaml');
      const config = fs.readFileSync(configPath, 'utf8');
      
      if (config.includes('openai_runtime: codex_app_server')) {
        this.results.runtime.configured = { 
          status: 'ok', 
          message: 'Codex runtime configured' 
        };
        console.log('  ✅ Runtime: Codex configured');
      } else {
        this.results.runtime.configured = { 
          status: 'warning', 
          message: 'Standard Hermes runtime active' 
        };
        console.log('  ⚠️  Runtime: Standard Hermes (use /codex-runtime codex_app_server to switch)');
      }
    } catch (error) {
      this.results.runtime.configured = { 
        status: 'error', 
        message: 'Cannot read Hermes config' 
      };
      console.log('  ❌ Runtime: Cannot determine status');
    }
  }

  checkPluginAvailability() {
    console.log('\n🔌 Checking Plugin Availability...');
    
    try {
      const plugins = execSync('codex plugin list', { encoding: 'utf8' });
      const installedPlugins = plugins.split('\n').filter(line => line.trim());
      
      const recommendedPlugins = ['linear', 'github', 'gmail'];
      const availablePlugins = installedPlugins.filter(plugin => 
        recommendedPlugins.some(recommended => plugin.includes(recommended))
      );
      
      this.results.plugins.available = {
        status: availablePlugins.length > 0 ? 'ok' : 'warning',
        installed: availablePlugins,
        message: `${availablePlugins.length} recommended plugins installed`
      };
      
      if (availablePlugins.length > 0) {
        console.log(`  ✅ Plugins: ${availablePlugins.length} installed`);
        availablePlugins.forEach(plugin => console.log(`    - ${plugin}`));
      } else {
        console.log('  ⚠️  Plugins: None installed (optional but recommended)');
        console.log('    Install with: codex plugin install linear github gmail');
      }
    } catch (error) {
      this.results.plugins.available = { 
        status: 'error', 
        message: 'Cannot check plugins' 
      };
      console.log('  ❌ Plugins: Cannot check status');
    }
  }

  determineOverallStatus() {
    const criticalErrors = Object.values(this.results.prerequisites)
      .filter(result => result.status === 'error').length;
    
    const runtimeErrors = Object.values(this.results.runtime)
      .filter(result => result.status === 'error').length;
    
    if (criticalErrors > 0 || runtimeErrors > 0) {
      this.results.overall = 'needs_setup';
    } else {
      this.results.overall = 'ready';
    }
  }

  printResults() {
    console.log('\n📊 Validation Summary');
    console.log('=' .repeat(50));
    
    if (this.results.overall === 'ready') {
      console.log('🎉 Integration Ready!');
      console.log('\nNext steps:');
      console.log('  1. Use /codex-runtime codex_app_server to enable Codex runtime');
      console.log('  2. Restart Hermes session');
      console.log('  3. Request development tasks normally - tools will use Codex automatically');
    } else {
      console.log('⚠️  Setup Required');
      console.log('\nIssues found:');
      
      Object.entries(this.results.prerequisites).forEach(([key, result]) => {
        if (result.status === 'error') {
          console.log(`  - ${result.message}`);
        }
      });
      
      Object.entries(this.results.runtime).forEach(([key, result]) => {
        if (result.status === 'error') {
          console.log(`  - ${result.message}`);
        }
      });
    }
    
    console.log('\n📚 Troubleshooting: https://github.com/blittersptyltd/ai-guides');
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new IntegrationValidator();
  validator.validateAll().then(ready => {
    process.exit(ready ? 0 : 1);
  });
}

module.exports = IntegrationValidator;