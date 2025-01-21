import { useAuth } from '@/contexts/auth-context';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/sidebar/index';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Login } from '@/pages/login';
import { Dashboard } from '@/pages/dashboard';
import { Models } from '@/pages/models';
import { ModelDetails } from '@/pages/model-details';
import { Posts } from '@/pages/posts';
import { Tasks } from '@/pages/tasks';
import { Chats } from '@/pages/chats';
import { Reviews } from '@/pages/reviews';
import { Stories } from '@/pages/stories';
import { Users } from '@/pages/users';

function App() {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <div className="flex flex-col md:flex-row min-h-screen">
          <div className="hidden md:flex md:flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 pb-16 md:pb-0 bg-background min-w-0">
            <main className="max-w-[2000px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/models" element={<ProtectedRoute><Models /></ProtectedRoute>} />
                <Route path="/models/:id" element={<ProtectedRoute><ModelDetails /></ProtectedRoute>} />
                <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
          <MobileNav />
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      )}
      <Toaster />
    </>
  );
}

export default App;