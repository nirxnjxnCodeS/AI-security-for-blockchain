'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { useDeploymentHistoryStore } from '@/store/useDeploymentHistoryStore';
import { useNetworkStore } from '@/store/useNetworkStore';
import { analyzeContractWithOpenAI } from '@/utils/openai-analyzer';
import { deployContract, getNetworkName, getExplorerUrl } from '@/utils/contract-deployer';
import { downloadJSON, downloadText } from '@/utils/download-helpers';
import { getConstructorInputs, parseConstructorArgs } from '@/utils/abi-parser';
import { useState } from 'react';
import toast from 'react-hot-toast';
import SecurityReport from './SecurityReport';
import ConstructorArgsModal from './ConstructorArgsModal';
import DeploymentSuccessModal from './DeploymentSuccessModal';
import { Rocket, ExternalLink, Loader2, Download, FileJson, FileCode, FileText, CheckCircle2 } from 'lucide-react';

export default function DeploymentPanel() {
  const { currentProject, updateProject } = useProjectStore();
  const { provider, signer, chainId, isConnected } = useWalletStore();
  const { currentStep, setStep, setStepStatus, resetWorkflow } = useWorkflowStore();
  const { addDeployment } = useDeploymentHistoryStore();
  const { selectedNetwork } = useNetworkStore();
  const [showReport, setShowReport] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConstructorModal, setShowConstructorModal] = useState(false);
  const [constructorInputs, setConstructorInputs] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deployedInfo, setDeployedInfo] = useState<{address: string, network: number, txHash?: string} | null>(null);
  const [includeAIAnalysis, setIncludeAIAnalysis] = useState(true); // AI Analysis toggle

  const startWorkflow = async () => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setShowSuccessModal(false);
    setDeployedInfo(null);
    resetWorkflow();

    // IMPORTANT: Clear old ABI and bytecode to ensure fresh compilation
    console.log('🧹 Clearing old ABI and bytecode...');
    updateProject(currentProject.id, {
      abi: undefined,
      bytecode: undefined,
      securityReport: undefined
    });

    try {
      // Step 1: Compile Contract using API
      setStep('compiling');
      setStepStatus('compiling', 'in-progress');
      toast.loading('Compiling contract...', { id: 'compile' });

      const compileResponse = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractCode: currentProject.contractCode,
        }),
      });

      const compilationResult = await compileResponse.json();

      if (!compilationResult.success) {
        throw new Error(`Compilation failed: ${compilationResult.errors?.join('\n')}`);
      }

      setStepStatus('compiling', 'completed');
      toast.success('Contract compiled successfully', { id: 'compile' });

      // Step 2: Generate ABI
      setStep('generating-abi');
      setStepStatus('generating-abi', 'in-progress');
      toast.loading('Generating ABI...', { id: 'abi' });

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('💾 Saving ABI to project store...');
      console.log('ABI from compilation:', compilationResult.abi);

      updateProject(currentProject.id, { abi: compilationResult.abi });

      setStepStatus('generating-abi', 'completed');
      toast.success('ABI generated', { id: 'abi' });

      // Step 3: Generate Bytecode
      setStep('generating-bytecode');
      setStepStatus('generating-bytecode', 'in-progress');
      toast.loading('Generating bytecode...', { id: 'bytecode' });

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('💾 Saving Bytecode to project store...');
      console.log('Bytecode length:', compilationResult.bytecode?.length);

      updateProject(currentProject.id, { bytecode: compilationResult.bytecode });

      setStepStatus('generating-bytecode', 'completed');
      toast.success('Bytecode generated', { id: 'bytecode' });

      // Step 4: AI Security Analysis (Optional)
      if (includeAIAnalysis) {
        setStep('analyzing');
        setStepStatus('analyzing', 'in-progress');
        toast.loading('Analyzing contract with AI...', { id: 'analyze' });

        const securityReport = await analyzeContractWithOpenAI(currentProject.contractCode);
        updateProject(currentProject.id, { securityReport });

        setStepStatus('analyzing', 'completed');
        toast.success('Security analysis complete', { id: 'analyze' });

        // Step 5: Show Review
        setStep('review');
        setStepStatus('review', 'in-progress');
        setShowReport(true);
        setIsProcessing(false);
      } else {
        // Skip AI analysis, go directly to deployment check
        console.log('⏭️ Skipping AI Analysis (user disabled)');
        setStepStatus('analyzing', 'completed'); // Mark as completed but skipped
        toast.success('Skipping AI analysis', { id: 'analyze' });

        // Wait a bit for state to update, then check constructor and proceed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get fresh ABI and bytecode from compilation result
        await handleContinueToDeployWithData(compilationResult.abi, compilationResult.bytecode);
      }
    } catch (error: any) {
      console.error('Workflow error:', error);
      setStepStatus(currentStep, 'error');
      toast.error(error.message || 'Workflow failed');
      setIsProcessing(false);
    }
  };

  // Function to handle deployment with provided ABI/bytecode (for when AI analysis is skipped)
  const handleContinueToDeployWithData = async (abi: any, bytecode: string) => {
    if (!currentProject || !provider || !signer || !chainId) {
      toast.error('Missing deployment requirements');
      return;
    }

    // Check if ABI exists
    if (!abi || !Array.isArray(abi)) {
      console.error('❌ ABI is missing or invalid:', abi);
      toast.error('Contract ABI not available. Please recompile the contract.');
      return;
    }

    // Check if constructor has arguments
    console.log('=== CONSTRUCTOR CHECK (with direct data) ===');
    console.log('Current Project ID:', currentProject.id);
    console.log('Provided ABI type:', typeof abi);
    console.log('Provided ABI:', abi);

    const inputs = getConstructorInputs(abi);
    console.log('Constructor Inputs Found:', inputs);
    console.log('Number of inputs:', inputs.length);

    if (inputs.length > 0) {
      console.log('✅ Constructor has arguments, showing modal...');
      setConstructorInputs(inputs);
      setShowConstructorModal(true);
      setStepStatus('review', 'completed');
      setIsProcessing(false);
      return;
    }

    console.log('⚠️ No constructor arguments, deploying directly...');
    // Deploy without constructor args
    await performDeployment([]);
  };

  const handleContinueToDeploy = async () => {
    if (!currentProject || !provider || !signer || !chainId) {
      toast.error('Missing deployment requirements');
      return;
    }

    // Check if ABI exists
    if (!currentProject.abi || !Array.isArray(currentProject.abi)) {
      console.error('❌ ABI is missing or invalid:', currentProject.abi);
      toast.error('Contract ABI not available. Please recompile the contract.');
      return;
    }

    // Check if constructor has arguments
    console.log('=== CONSTRUCTOR CHECK ===');
    console.log('Current Project ID:', currentProject.id);
    console.log('Current Project ABI type:', typeof currentProject.abi);
    console.log('Current Project ABI:', currentProject.abi);

    const inputs = getConstructorInputs(currentProject.abi);
    console.log('Constructor Inputs Found:', inputs);
    console.log('Number of inputs:', inputs.length);

    if (inputs.length > 0) {
      console.log('✅ Constructor has arguments, showing modal...');
      setConstructorInputs(inputs);
      setShowConstructorModal(true);
      setShowReport(false);
      setStepStatus('review', 'completed');
      return;
    }

    console.log('⚠️ No constructor arguments, deploying directly...');
    // Deploy without constructor args
    await performDeployment([]);
  };

  const performDeployment = async (constructorArgs: string[]) => {
    if (!currentProject || !provider || !signer || !selectedNetwork) {
      toast.error('Missing deployment requirements');
      return;
    }

    // Check if ABI and bytecode exist
    if (!currentProject.abi || !currentProject.bytecode) {
      toast.error('Contract not compiled properly. Please recompile.');
      return;
    }

    // Verify wallet is on correct network
    if (chainId !== selectedNetwork.chainId) {
      toast.error(`Please switch to ${selectedNetwork.name} in your wallet`);
      return;
    }

    setShowReport(false);
    setShowConstructorModal(false);
    setStepStatus('review', 'completed');
    setIsProcessing(true);

    try {
      // Step 6: Deploy Contract
      setStep('deploying');
      setStepStatus('deploying', 'in-progress');
      toast.loading(`Deploying contract to ${selectedNetwork.name}...`, { id: 'deploy' });

      // Parse constructor arguments
      const parsedArgs = constructorArgs.length > 0
        ? parseConstructorArgs(constructorInputs, constructorArgs)
        : [];

      console.log('🚀 DEPLOYING CONTRACT');
      console.log('📋 ABI:', currentProject.abi);
      console.log('📦 Bytecode length:', currentProject.bytecode.length);
      console.log('🔧 Constructor args:', parsedArgs);

      const result = await deployContract(
        provider,
        signer,
        currentProject.abi,
        currentProject.bytecode,
        parsedArgs
      );

      console.log('AFTER deployContract call, result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      console.log('✅ Deployment successful! Address:', result.contractAddress);

      // Update workflow state
      setStepStatus('deploying', 'completed');
      setStep('completed');
      setStepStatus('completed', 'completed');

      console.log('✅ Setting showSuccessModal to TRUE');

      // Save to deployment history
      addDeployment({
        projectName: currentProject.name,
        contractAddress: result.contractAddress!,
        network: selectedNetwork.chainId,
        networkName: selectedNetwork.name,
        transactionHash: result.transactionHash,
        deployedAt: Date.now(),
        abi: currentProject.abi,
        bytecode: currentProject.bytecode!,
        hasSecurityReport: !!currentProject.securityReport,
      });

      // IMMEDIATELY show success modal
      setDeployedInfo({
        address: result.contractAddress!,
        network: selectedNetwork.chainId,
        txHash: result.transactionHash,
      });
      setShowSuccessModal(true);
      setIsProcessing(false);

      console.log('✅ Success modal state updated!');

      toast.success(`Contract deployed successfully to ${selectedNetwork.name}!`, { id: 'deploy' });

      // Update persistent store
      updateProject(currentProject.id, {
        deployedAddress: result.contractAddress,
        deployedNetwork: selectedNetwork.chainId,
      });
    } catch (error: any) {
      console.error('Deployment error:', error);
      setStepStatus('deploying', 'error');
      toast.error(error.message || 'Deployment failed');
      setIsProcessing(false);
    }
  };

  const handleFixIssues = () => {
    setShowReport(false);
    resetWorkflow();
    toast('Please fix the issues in your contract and try again', {
      icon: 'ℹ️',
    });
  };

  if (!currentProject) {
    return (
      <div className="bg-dark-card rounded-lg border border-dark-border p-8 text-center">
        <p className="text-gray-400">Select a project to start the deployment workflow</p>
      </div>
    );
  }

  if (showConstructorModal) {
    return (
      <ConstructorArgsModal
        inputs={constructorInputs}
        onConfirm={performDeployment}
        onCancel={() => {
          setShowConstructorModal(false);
          setShowReport(true);
        }}
      />
    );
  }

  if (showReport && currentProject.securityReport) {
    return (
      <SecurityReport
        report={currentProject.securityReport}
        onContinue={handleContinueToDeploy}
        onFix={handleFixIssues}
      />
    );
  }

  const handleDownloadABI = () => {
    if (!currentProject.abi) return;
    downloadJSON(currentProject.abi, `${currentProject.name}-ABI.json`);
    toast.success('ABI downloaded');
  };

  const handleDownloadBytecode = () => {
    if (!currentProject.bytecode) return;
    downloadText(currentProject.bytecode, `${currentProject.name}-Bytecode.txt`);
    toast.success('Bytecode downloaded');
  };

  const handleDownloadSecurityReport = () => {
    if (!currentProject.securityReport) return;
    downloadJSON(currentProject.securityReport, `${currentProject.name}-SecurityReport.json`);
    toast.success('Security report downloaded');
  };

  const handleDownloadDeploymentDetails = () => {
    if (!currentProject.deployedAddress) return;

    const deploymentDetails = {
      projectName: currentProject.name,
      description: currentProject.description,
      contractAddress: currentProject.deployedAddress,
      network: getNetworkName(currentProject.deployedNetwork!),
      chainId: currentProject.deployedNetwork,
      explorerUrl: getExplorerUrl(currentProject.deployedNetwork!, currentProject.deployedAddress),
      deployedAt: new Date().toISOString(),
      abi: currentProject.abi,
      bytecode: currentProject.bytecode,
    };

    downloadJSON(deploymentDetails, `${currentProject.name}-DeploymentDetails.json`);
    toast.success('Deployment details downloaded');
  };

  const handleDownloadAll = () => {
    handleDownloadABI();
    handleDownloadBytecode();
    if (currentProject.securityReport) handleDownloadSecurityReport();
    handleDownloadDeploymentDetails();
    toast.success('All files downloaded');
  };

  if (!currentProject) {
    return (
      <div className="bg-dark-card rounded-lg border border-dark-border p-8 text-center">
        <p className="text-gray-400">Select a project to start the deployment workflow</p>
      </div>
    );
  }

  if (showConstructorModal) {
    return (
      <ConstructorArgsModal
        inputs={constructorInputs}
        onConfirm={performDeployment}
        onCancel={() => {
          setShowConstructorModal(false);
          setShowReport(true);
        }}
      />
    );
  }

  if (showReport && currentProject.securityReport) {
    return (
      <SecurityReport
        report={currentProject.securityReport}
        onContinue={handleContinueToDeploy}
        onFix={handleFixIssues}
      />
    );
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && deployedInfo && (
        <DeploymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setDeployedInfo(null);
            resetWorkflow();
          }}
          contractAddress={deployedInfo.address}
          network={deployedInfo.network}
          transactionHash={deployedInfo.txHash}
          deployedAt={Date.now()}
          projectName={currentProject.name}
          abi={currentProject.abi}
          bytecode={currentProject.bytecode}
          hasSecurityReport={!!currentProject.securityReport}
        />
      )}

      <div className="bg-dark-card rounded-lg border border-dark-border p-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
            <Rocket className="text-primary" size={40} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Deploy</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Start the deployment workflow. Your contract will be compiled{includeAIAnalysis ? ', analyzed for security issues,' : ''} and deployed to the blockchain.
            </p>
          </div>

          {/* AI Analysis Toggle */}
          <div className="bg-dark-hover rounded-lg p-4 max-w-md mx-auto border border-dark-border">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">AI Security Analysis</div>
                  <div className="text-gray-400 text-sm">Analyze contract for vulnerabilities</div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeAIAnalysis}
                  onChange={(e) => setIncludeAIAnalysis(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          {!isConnected && (
            <div className="bg-warning/10 border border-warning rounded-lg p-4 text-warning">
              Please connect your wallet to continue
            </div>
          )}

          {isConnected && selectedNetwork && chainId !== selectedNetwork.chainId && (
            <div className="bg-warning/10 border border-warning rounded-lg p-4 text-warning">
              Please switch to {selectedNetwork.name} in your wallet to deploy
            </div>
          )}

          <button
            onClick={startWorkflow}
            disabled={!isConnected || isProcessing || (!!selectedNetwork && chainId !== selectedNetwork.chainId)}
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center gap-3 mx-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Processing...
              </>
            ) : (
              <>
                <Rocket size={24} />
                Start Deployment Workflow
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
