import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Feed from './components/Feed.jsx';
import LoginForm from './components/LoginForm.jsx';
import NavBar from './components/NavBar.jsx';
import PostEditor from './components/PostEditor.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-stone-900">
        <NavBar />
        <main className="mx-auto max-w-4xl px-6 py-10">
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
