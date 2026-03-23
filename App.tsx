
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from './types';
import { addUser, findUserByEmail, updateUserPassword, getUsers } from './services/storageService';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import { Layout, LogIn, UserPlus, Lock, ArrowRight, LogOut, Globe, MapPin, FileText, Crown, Mail, Key, User as UserIcon, Camera, Aperture, RefreshCw, ShieldAlert, ScanFace } from 'lucide-react';

// Logo Image
const HOTEL_LOGO = "https://files.oaiusercontent.com/file-2uXjNyiDhEZ5y9uHbCnDT8?se=2025-02-18T12%3A58%3A18Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Ddb284b80-16d7-4632-a5e3-c24098492080.webp&sig=5Nq9Tj8u6FkHwF3D7G3Fkv%2ByiF8xT5L/g/2d7nZ04r4%3D";

// Rajasthan Tourism Background (Amer Fort)
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop";

// Indian States List
const INDIAN_STATES = [
  "Rajasthan", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Mumbai"
];

// --- BIOMETRIC COMPARISON ALGORITHM ---
// This function compares two base64 images by pixel structure analysis
const compareBiometricData = async (registeredImage: string, currentImage: string): Promise<number> => {
    return new Promise((resolve) => {
        const img1 = new Image();
        const img2 = new Image();
        let loaded = 0;

        const processComparison = () => {
            loaded++;
            if (loaded === 2) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(0);

                // Reduce resolution for pattern matching (50x50 is sufficient for structural comparison)
                const size = 50;
                canvas.width = size;
                canvas.height = size;

                // 1. Get Data for Registered Image
                ctx.drawImage(img1, 0, 0, size, size);
                const data1 = ctx.getImageData(0, 0, size, size).data;

                // 2. Get Data for Current Image
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img2, 0, 0, size, size);
                const data2 = ctx.getImageData(0, 0, size, size).data;

                let diffScore = 0;
                
                // 3. Compare Pixels (Grayscale Intensity)
                for (let i = 0; i < data1.length; i += 4) {
                    // Convert RGB to Grayscale brightness
                    const brightness1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3;
                    const brightness2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3;
                    
                    // Accumulate difference
                    diffScore += Math.abs(brightness1 - brightness2);
                }

                // 4. Calculate Percentage Match
                // Maximum possible difference per pixel is 255. Total pixels = size * size.
                const maxPossibleDiff = 255 * (size * size);
                const matchPercentage = 100 - ((diffScore / maxPossibleDiff) * 100);
                
                resolve(matchPercentage);
            }
        };

        img1.onload = processComparison;
        img2.onload = processComparison;
        img1.src = registeredImage;
        img2.src = currentImage;
    });
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'DASHBOARD'>('LOGIN');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Role is strictly defaulted to USER now
  const role: UserRole = UserRole.USER;
  
  // Login Verification State
  const [loginPhase, setLoginPhase] = useState<'CREDENTIALS' | 'FACE_VERIFY'>('CREDENTIALS');
  const [tempLoginUser, setTempLoginUser] = useState<User | null>(null);

  // Guest Specific Registration State
  const [origin, setOrigin] = useState<'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');
  const [locationState, setLocationState] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Camera & Face Detection State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear errors and fields when switching views
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    // Reset guest fields
    setOrigin('DOMESTIC');
    setLocationState('');
    setLocationCountry('');
    setIdType('');
    setIdNumber('');
    // Reset camera & login flow
    stopCamera();
    setFaceImage(null);
    setLoginPhase('CREDENTIALS');
    setTempLoginUser(null);
  }, [view]);

  // Clean up camera on unmount
  useEffect(() => {
      return () => stopCamera();
  }, []);

  const startCamera = async () => {
      setError('');
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
          });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setIsCameraActive(true);
          }
      } catch (err) {
          setError("Unable to access camera. Please allow camera permissions for biometric verification.");
          console.error(err);
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
          setIsCameraActive(false);
      }
  };

  // Helper to check lighting
  const checkImageClarity = (ctx: CanvasRenderingContext2D, width: number, height: number): { valid: boolean; message?: string } => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let r, g, b, avg;
    let colorSum = 0;
    
    // Sample pixels (step by 4 to optimize speed)
    for(let x = 0, len = data.length; x < len; x+=16) {
        r = data[x];
        g = data[x+1];
        b = data[x+2];
        avg = Math.floor((r+g+b)/3);
        colorSum += avg;
    }

    const brightness = Math.floor(colorSum / (data.length / 16));
    
    // Brightness thresholds (0-255)
    if (brightness < 50) {
        return { valid: false, message: "Lighting is too dark. Please find a well-lit area." };
    }
    if (brightness > 230) {
        return { valid: false, message: "Too much glare. Please adjust lighting." };
    }

    return { valid: true };
  };

  const captureFace = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          
          if (context && video.videoWidth && video.videoHeight) {
              // Set canvas dimensions to match video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // 1. Mirroring Fix: Flip horizontally to match the user's mirror view
              context.save(); // Save state
              context.translate(canvas.width, 0);
              context.scale(-1, 1);
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              context.restore(); // Restore state so `getImageData` works on the drawn content properly
              
              // 2. Clarity Check
              const clarity = checkImageClarity(context, canvas.width, canvas.height);
              if (!clarity.valid) {
                  setError(`Face Capture Failed: ${clarity.message}`);
                  return;
              }

              // Convert to base64
              const image = canvas.toDataURL('image/jpeg');
              setFaceImage(image);
              setError('');
              stopCamera();
          } else {
             setError("Camera not ready yet. Please wait a moment.");
          }
      }
  };

  const retakePhoto = () => {
      setFaceImage(null);
      startCamera();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = findUserByEmail(email);
    // Simple mock password check (any password > 3 chars works for demo if user exists)
    if (user && password.length >= 3) {
      if (user.faceImage) {
          // User has biometric data registered, require face check
          setTempLoginUser(user);
          setLoginPhase('FACE_VERIFY');
          setSuccessMsg('Credentials verified. Proceeding to Biometric Security Check.');
          setTimeout(() => {
              setSuccessMsg('');
              startCamera();
          }, 1000);
      } else {
          // Legacy user or no biometrics
          setCurrentUser(user);
          setView('DASHBOARD');
      }
    } else {
      setError('Invalid credentials. (Hint: Register first if new)');
    }
  };

  const verifyFaceAndLogin = async () => {
      if (!faceImage || !tempLoginUser) {
          setError("Please capture your face first.");
          return;
      }
      
      if (!tempLoginUser.faceImage) {
          setError("Account data error: No registered face to compare against.");
          return;
      }

      setSuccessMsg("Scanning Biometric Features...");
      
      // Perform Image Comparison
      try {
          // Wait for comparison algorithm
          const matchScore = await compareBiometricData(tempLoginUser.faceImage, faceImage);
          console.log("Biometric Match Score:", matchScore);

          // Threshold for acceptance (75% match required)
          // This allows for slight movement/lighting changes but rejects completely different images
          const MATCH_THRESHOLD = 75;

          if (matchScore >= MATCH_THRESHOLD) {
              setSuccessMsg(`Identity Verified (Match: ${matchScore.toFixed(1)}%). Granting access...`);
              setTimeout(() => {
                  setCurrentUser(tempLoginUser);
                  setView('DASHBOARD');
                  setTempLoginUser(null);
                  setLoginPhase('CREDENTIALS');
              }, 1500);
          } else {
              setError(`Identity Verification Failed. Biometric Mismatch (${matchScore.toFixed(1)}%). Please retry.`);
              setFaceImage(null);
              setTimeout(() => startCamera(), 2000);
          }
      } catch (err) {
          console.error(err);
          setError("Biometric processing error. Please try again.");
      }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Email Check
    if (findUserByEmail(email)) {
      setError('User already exists with this email.');
      return;
    }

    // 2. Guest Validation
    if (origin === 'DOMESTIC' && !locationState) {
        setError('Please select your State.');
        return;
    }
    if (origin === 'INTERNATIONAL' && !locationCountry) {
        setError('Please enter your Country.');
        return;
    }
    if (!idType || !idNumber) {
        setError('Identity Proof details are required.');
        return;
    }
    
    // 3. Biometric Requirement
    if (!faceImage) {
        setError('Biometric Face Capture is mandatory. We require a clear photo for security.');
        return;
    }

    // 4. Simulated Biometric Duplicate Check
    const existingUsers = getUsers();
    const duplicateIdentity = existingUsers.find(u => 
        u.role === UserRole.USER && 
        u.idProofNumber === idNumber && 
        u.faceImage 
    );

    if (duplicateIdentity) {
        setError(`SECURITY ALERT: Biometric mismatch. Identity ${idType} ${idNumber} is already registered.`);
        return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role, // Always UserRole.USER
      joinedAt: new Date().toISOString(),
      faceImage: faceImage || undefined,
      origin,
      location: origin === 'DOMESTIC' ? locationState : locationCountry,
      idProofType: idType,
      idProofNumber: idNumber
    };

    addUser(newUser);
    setSuccessMsg('Registration Successful! Your face ID has been secured.');
    setTimeout(() => setView('LOGIN'), 1500);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const user = findUserByEmail(email);
    if (user) {
        // Simulate reset
        updateUserPassword(email);
        setSuccessMsg(`Password reset link has been sent to ${email}. (Check console/mock)`);
    } else {
        setError('No account found with that email.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('LOGIN');
  };

  // Reusable Camera Component UI
  const renderCameraUI = (mode: 'REGISTER' | 'LOGIN') => (
      <div className="bg-[#2c1a1a] p-4 rounded-lg border border-amber-900 space-y-4 shadow-xl">
        <h4 className="font-serif font-bold text-amber-100 text-sm border-b border-amber-700 pb-2 flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-amber-500" /> 
            {mode === 'REGISTER' ? 'Register Face ID' : 'Verify Identity'}
        </h4>
        
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-amber-700/50 group">
            {faceImage ? (
                <img src={faceImage} alt="Captured" className="w-full h-full object-cover" /> 
                // Note: removed scale-x-[-1] from img because we now save the mirrored version directly in captureFace
            ) : (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    onLoadedMetadata={() => videoRef.current?.play()}
                    className={`w-full h-full object-cover transform scale-x-[-1] ${!isCameraActive ? 'hidden' : ''}`}
                />
            )}
            
            {!isCameraActive && !faceImage && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-amber-500/50">
                    <Camera className="w-12 h-12" />
                    <span className="text-xs uppercase tracking-widest">Camera Inactive</span>
                </div>
            )}

            {isCameraActive && (
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-white font-mono bg-black/50 px-1 rounded">REC</span>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-3">
            {!isCameraActive && !faceImage && (
                <button 
                    type="button" 
                    onClick={startCamera}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                    <Camera className="w-4 h-4" /> Start Camera
                </button>
            )}
            
            {isCameraActive && (
                <button 
                    type="button" 
                    onClick={captureFace}
                    className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-green-500 shadow-[0_0_10px_rgba(22,163,74,0.5)]"
                >
                    <Aperture className="w-4 h-4" /> Capture Face
                </button>
            )}

            {faceImage && (
                <button 
                    type="button" 
                    onClick={retakePhoto}
                    className="bg-amber-900 hover:bg-amber-950 text-amber-100 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-amber-700"
                >
                    <RefreshCw className="w-4 h-4" /> Retake Photo
                </button>
            )}
        </div>
        
        <p className="text-[10px] text-amber-400/60 text-center italic">
             {mode === 'REGISTER' 
                ? "* Ensure your face is evenly lit and clearly visible."
                : "* Look directly at the camera to verify your identity."}
        </p>
    </div>
  );

  const renderDashboard = () => {
    // White screen prevention:
    // If we are in Dashboard view but user is lost (e.g. backend sync error), redirect or show loading.
    if (!currentUser) {
        setView('LOGIN');
        return null; 
    }
    
    // Determine which dashboard to render safely
    let dashboardComponent;
    if (currentUser.role === UserRole.ADMIN) {
        dashboardComponent = <AdminDashboard user={currentUser} />;
    } else if (currentUser.role === UserRole.STAFF) {
        dashboardComponent = <StaffDashboard user={currentUser} />;
    } else {
        // Default to User Dashboard if role is USER or undefined/unknown
        dashboardComponent = <UserDashboard user={currentUser} />;
    }

    // Layout wrapper for dashboard
    return (
      <div className="min-h-screen bg-[#fffbf0] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#2c1a1a] text-amber-50 hidden md:flex flex-col fixed h-full z-20 border-r border-amber-900/30">
            <div className="p-6 border-b border-amber-900/30 flex items-center gap-3 bg-[#1f1212]">
                <img 
                  src={HOTEL_LOGO} 
                  alt="Rajvista" 
                  className="w-12 h-12 object-cover rounded-lg border-2 border-amber-600" 
                />
                <div>
                    <h1 className="font-serif font-bold text-lg leading-tight text-amber-500">Rajvista<br/>Collection</h1>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <div className="px-4 py-2 bg-amber-900/20 rounded-lg text-amber-500 font-serif font-bold text-sm mb-4 tracking-wide">
                    {currentUser.role === 'ADMIN' ? 'Admin Control' : currentUser.role === 'STAFF' ? 'Staff Access' : 'Guest Portal'}
                </div>
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-3 px-4 py-3 text-amber-100 hover:bg-amber-900/40 hover:text-amber-400 rounded-lg w-full transition-colors bg-amber-900/20 border border-transparent hover:border-amber-900/50">
                    <Layout className="w-5 h-5" />
                    Dashboard
                </button>
            </nav>

            <div className="p-4 border-t border-amber-900/30 bg-[#1f1212]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white font-serif border-2 border-amber-400 overflow-hidden">
                        {currentUser.faceImage ? (
                            <img src={currentUser.faceImage} alt="Face" className="w-full h-full object-cover" />
                        ) : (
                            currentUser.name.charAt(0)
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate text-amber-100">{currentUser.name}</p>
                        <p className="text-xs text-amber-500/80 truncate">{currentUser.email}</p>
                        {currentUser.location && (
                             <p className="text-[10px] text-amber-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {currentUser.location}
                             </p>
                        )}
                    </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-200 text-sm px-2 w-full transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </aside>

        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden fixed top-0 w-full bg-[#1f1212] text-amber-50 z-20 p-4 flex justify-between items-center shadow-md border-b border-amber-900/50">
             <div className="flex items-center gap-2">
                <img 
                  src={HOTEL_LOGO} 
                  alt="Rajvista" 
                  className="w-8 h-8 object-cover rounded border border-amber-600" 
                />
                <span className="font-serif font-bold text-amber-500">Rajvista</span>
             </div>
             <button onClick={handleLogout} className="text-amber-200">
                <LogOut className="w-5 h-5" />
             </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
            {dashboardComponent}
        </main>
      </div>
    );
  };

  // Auth Views
  if (view === 'DASHBOARD') return renderDashboard();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Full Screen Background with Rajasthani Theme */}
        <div className="absolute inset-0 z-0">
             <img 
                src={BACKGROUND_IMAGE}
                alt="Rajvista Background" 
                className="w-full h-full object-cover"
             />
             {/* Gradient Overlay for Text Readability - Deep Maroon to Transparent (Lighter) */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0f] via-[#2c1a1a]/60 to-transparent"></div>
             {/* Decorative pattern overlay simulation */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
        </div>

        {/* Auth Card - Royal Invitation Style */}
        <div className="relative z-10 w-full max-w-md px-4 my-8">
            <div className="bg-[#fffbf0] rounded-t-3xl rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-double border-amber-700/40 relative overflow-hidden">
                
                {/* Decorative Top Border */}
                <div className="h-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700"></div>
                
                <div className="p-8 md:p-10 relative">
                    {/* Ornamental Header */}
                    <div className="text-center mb-8">
                        {/* Logo Container resembling a Jharokha (Window) */}
                        <div className="mx-auto w-24 h-24 relative mb-4">
                            <div className="absolute inset-0 bg-amber-100 rounded-t-full border-2 border-amber-600 transform rotate-45 scale-75 opacity-20"></div>
                            <div className="absolute inset-0 bg-amber-100 rounded-t-full border-2 border-amber-600 transform -rotate-45 scale-75 opacity-20"></div>
                            <img 
                                src={HOTEL_LOGO} 
                                alt="Rajvista" 
                                className="w-24 h-24 object-cover rounded-t-full rounded-b-lg border-4 border-amber-600 shadow-lg relative z-10" 
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white p-1 rounded-full border-2 border-white shadow-sm z-20">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        
                        <h2 className="text-3xl font-serif font-bold text-amber-900 tracking-wide uppercase mb-1">Rajvista</h2>
                        <div className="flex items-center justify-center gap-2 opacity-60 mb-2">
                             <div className="h-[1px] w-8 bg-amber-800"></div>
                             <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-amber-900">BEST HOTELS OF RAJASTHAN</span>
                             <div className="h-[1px] w-8 bg-amber-800"></div>
                        </div>
                        <p className="text-amber-800/70 font-serif italic text-sm">
                            {view === 'LOGIN' && loginPhase === 'CREDENTIALS' && 'Sign in to your royal account'}
                            {view === 'LOGIN' && loginPhase === 'FACE_VERIFY' && 'Verify your Royal Identity'}
                            {view === 'REGISTER' && 'Begin your journey with us'}
                            {view === 'FORGOT' && 'Recover your access'}
                        </p>
                    </div>

                    {error && <div className="mb-6 p-3 bg-red-50 text-red-800 text-sm rounded border border-red-200 font-serif text-center flex items-center gap-2 justify-center"><ShieldAlert className="w-4 h-4 shrink-0" /> {error}</div>}
                    {successMsg && <div className="mb-6 p-3 bg-green-50 text-green-800 text-sm rounded border border-green-200 font-serif text-center">{successMsg}</div>}

                    <form className="space-y-6" onSubmit={view === 'LOGIN' ? handleLogin : view === 'REGISTER' ? handleRegister : handleForgot}>
                        
                        {view === 'REGISTER' && (
                            <div className="space-y-1">
                                <label className="block text-xs font-serif font-bold text-amber-800 uppercase tracking-widest ml-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-4 w-4 text-amber-700/50" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        className="block w-full pl-9 pr-3 py-2.5 text-sm text-amber-900 bg-amber-50/50 border-b-2 border-amber-200 focus:outline-none focus:border-amber-700 focus:bg-amber-100/50 transition-colors placeholder-amber-800/30"
                                        placeholder="e.g. Vikram Singh"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Login: Email/Pass Phase OR Register Phase OR Forgot Phase */}
                        {(view !== 'LOGIN' || loginPhase === 'CREDENTIALS') && (
                            <>
                                <div className="space-y-1">
                                    <label className="block text-xs font-serif font-bold text-amber-800 uppercase tracking-widest ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-amber-700/50" />
                                        </div>
                                        <input 
                                            type="email" 
                                            required 
                                            className="block w-full pl-9 pr-3 py-2.5 text-sm text-amber-900 bg-amber-50/50 border-b-2 border-amber-200 focus:outline-none focus:border-amber-700 focus:bg-amber-100/50 transition-colors placeholder-amber-800/30"
                                            placeholder="e.g. guest@rambagh.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {view !== 'FORGOT' && (
                                    <div className="space-y-1">
                                        <label className="block text-xs font-serif font-bold text-amber-800 uppercase tracking-widest ml-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Key className="h-4 w-4 text-amber-700/50" />
                                            </div>
                                            <input 
                                                type="password" 
                                                required 
                                                className="block w-full pl-9 pr-3 py-2.5 text-sm text-amber-900 bg-amber-50/50 border-b-2 border-amber-200 focus:outline-none focus:border-amber-700 focus:bg-amber-100/50 transition-colors placeholder-amber-800/30"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {view === 'REGISTER' && (
                            <>
                                {/* Guest Specific Fields with Royal Styling */}
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-4 shadow-inner">
                                    <h4 className="font-serif font-bold text-amber-800 text-sm border-b border-amber-200 pb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-amber-600" /> Guest Identity
                                    </h4>
                                    
                                    {/* Origin Toggle */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-amber-700 mb-2 uppercase tracking-widest">Origin</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer text-amber-900">
                                                <input 
                                                    type="radio" 
                                                    name="origin" 
                                                    className="accent-amber-700 w-4 h-4"
                                                    checked={origin === 'DOMESTIC'}
                                                    onChange={() => setOrigin('DOMESTIC')}
                                                />
                                                Domestic (India)
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer text-amber-900">
                                                <input 
                                                    type="radio" 
                                                    name="origin" 
                                                    className="accent-amber-700 w-4 h-4"
                                                    checked={origin === 'INTERNATIONAL'}
                                                    onChange={() => setOrigin('INTERNATIONAL')}
                                                />
                                                International
                                            </label>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-xs font-serif text-amber-800 mb-1 flex items-center gap-1 font-semibold">
                                            <MapPin className="w-3 h-3" />
                                            {origin === 'DOMESTIC' ? 'Select State' : 'Enter Country'}
                                        </label>
                                        {origin === 'DOMESTIC' ? (
                                            <select 
                                                className="w-full px-3 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-600 outline-none bg-white text-amber-900"
                                                value={locationState}
                                                onChange={(e) => setLocationState(e.target.value)}
                                            >
                                                <option value="">-- Choose State --</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        ) : (
                                            <input 
                                                type="text" 
                                                className="w-full px-3 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-600 outline-none bg-white text-amber-900 placeholder-amber-800/30"
                                                placeholder="e.g. United Kingdom"
                                                value={locationCountry}
                                                onChange={(e) => setLocationCountry(e.target.value)}
                                            />
                                        )}
                                    </div>

                                    {/* ID Proof */}
                                    <div>
                                        <label className="block text-xs font-serif text-amber-800 mb-1 flex items-center gap-1 font-semibold">
                                            <FileText className="w-3 h-3" /> Identity Proof
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select 
                                                className="col-span-1 px-2 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-600 outline-none bg-white text-amber-900"
                                                value={idType}
                                                onChange={(e) => setIdType(e.target.value)}
                                            >
                                                <option value="">-- Type --</option>
                                                {origin === 'DOMESTIC' ? (
                                                    <>
                                                        <option value="Aadhar Card">Aadhar Card</option>
                                                        <option value="Driving License">Driving License</option>
                                                        <option value="Voter ID">Voter ID</option>
                                                        <option value="PAN Card">PAN Card</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Passport">Passport</option>
                                                        <option value="International DL">Intl. License</option>
                                                    </>
                                                )}
                                            </select>
                                            <input 
                                                type="text" 
                                                className="col-span-1 px-3 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-600 outline-none bg-white text-amber-900 placeholder-amber-800/30"
                                                placeholder="ID Number"
                                                value={idNumber}
                                                onChange={(e) => setIdNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Camera Registration */}
                                {renderCameraUI('REGISTER')}
                            </>
                        )}

                        {/* Login Face Verification Camera UI */}
                        {view === 'LOGIN' && loginPhase === 'FACE_VERIFY' && renderCameraUI('LOGIN')}

                        {/* Submit Button */}
                        {view === 'LOGIN' && loginPhase === 'FACE_VERIFY' ? (
                            <button 
                                type="button" 
                                onClick={verifyFaceAndLogin}
                                className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-amber-50 font-serif font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] flex justify-center items-center gap-2 uppercase tracking-wider border border-green-600"
                            >
                                <ScanFace className="w-4 h-4" /> Verify & Enter
                            </button>
                        ) : (
                            <button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-50 font-serif font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] flex justify-center items-center gap-2 uppercase tracking-wider border border-amber-600"
                            >
                                {view === 'LOGIN' && <><LogIn className="w-4 h-4" /> Enter Palace</>}
                                {view === 'REGISTER' && <><UserPlus className="w-4 h-4" /> Join Registry</>}
                                {view === 'FORGOT' && <><Lock className="w-4 h-4" /> Reset Access</>}
                            </button>
                        )}
                    </form>

                    <div className="mt-8 pt-6 border-t border-amber-200 flex flex-col gap-3 text-sm text-center font-serif">
                        {view === 'LOGIN' && (
                            <>
                                {loginPhase === 'CREDENTIALS' && (
                                    <>
                                        <button onClick={() => setView('FORGOT')} className="text-amber-800/70 hover:text-amber-900 transition-colors">Forgot Password?</button>
                                        <p className="text-amber-800/70">New to Rajvista? <button onClick={() => setView('REGISTER')} className="text-amber-700 font-bold hover:underline">Register</button></p>
                                    </>
                                )}
                                {loginPhase === 'FACE_VERIFY' && (
                                     <button onClick={() => { setLoginPhase('CREDENTIALS'); stopCamera(); }} className="text-amber-700 font-medium hover:underline">
                                        Back to Password Login
                                     </button>
                                )}
                            </>
                        )}
                        {view !== 'LOGIN' && (
                            <button onClick={() => setView('LOGIN')} className="flex items-center justify-center gap-1 text-amber-800 font-medium hover:text-amber-950">
                                <ArrowRight className="w-4 h-4 rotate-180" /> Return to Entrance
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Decorative Bottom Pattern */}
                <div className="h-3 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-amber-800 opacity-50"></div>
            </div>
            
            {/* Footer Text */}
            <p className="text-center text-amber-50/60 text-xs mt-6 font-serif tracking-widest pb-8">
                © 2025 RAJVISTA COLLECTION • RAJASTHAN
            </p>
        </div>
    </div>
  );
};

export default App;
