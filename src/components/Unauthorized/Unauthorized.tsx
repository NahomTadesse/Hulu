import { Shield,Lock, XCircle, Key } from "lucide-react";


export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
       
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">HULU Admin Panel</h2>
              <p className="text-xs text-slate-500">Access Control System</p>
            </div>
          </div>
        </div>

    
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
       
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-2">
                <Key className="w-4 h-4" />
              </div>
            </div>
          </div>

         
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 mr-2" />
              ACCESS RESTRICTED
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-3">403 Forbidden</h1>
            
            <p className="text-slate-600 leading-relaxed">
              Your account does not have sufficient permissions to access this resource. 
              This page requires specific user privileges that are not assigned to your role.
            </p>
          </div>

      

        </div>


      </div>
    </div>
  );
}