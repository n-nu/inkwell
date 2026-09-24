import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Feed from './components/Feed.jsx';
import LoginForm from './components/LoginForm.jsx';
import NavBar from './components/NavBar.jsx';
import PostEditor from './components/PostEditor.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <NavBar />
        <main className="w-full px-4 py-6 md:mx-auto md:max-w-2xl md:px-6 md:py-8 lg:max-w-3xl">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/write" element={<PostEditor />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
