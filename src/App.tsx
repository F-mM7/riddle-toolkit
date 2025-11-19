import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './components/Home/Home';
import { CharCounter } from './components/CharCounter/CharCounter';
import { DifferenceOfCharacterSet } from './components/DifferenceOfCharacterSet/DifferenceOfCharacterSet';
import { ShiritoriSolver } from './components/ShiritoriSolver/ShiritoriSolver';
import { WordVenn } from './components/WordVenn/WordVenn';
import { Babanuki } from './components/Babanuki/Babanuki';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/char-counter" element={<CharCounter />} />
          <Route
            path="/difference-of-character-set"
            element={<DifferenceOfCharacterSet />}
          />
          <Route path="/shiritori-solver" element={<ShiritoriSolver />} />
          <Route path="/word-venn" element={<WordVenn />} />
          <Route path="/babanuki" element={<Babanuki />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
