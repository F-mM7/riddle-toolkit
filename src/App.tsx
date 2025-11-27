import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './components/Home/Home';
import { CharCounter } from './components/CharCounter/CharCounter';
import { DifferenceOfCharacterSet } from './components/DifferenceOfCharacterSet/DifferenceOfCharacterSet';
import { ShiritoriSolver } from './components/ShiritoriSolver/ShiritoriSolver';
import { WordVenn } from './components/WordVenn/WordVenn';
import { Babanuki } from './components/Babanuki/Babanuki';
import { WordLatticeSolver } from './components/WordLatticeSolver/WordLatticeSolver';
import { SkeletonSolver } from './components/SkeletonSolver/SkeletonSolver';
import KanaVisualizer from './components/KanaVisualizer/KanaVisualizer';
import { PrefectureRegex } from './components/PrefectureRegex/PrefectureRegex';
import { CharShifter } from './components/CharShifter/CharShifter';
import { CubeVisualizer } from './components/CubeVisualizer/CubeVisualizer';

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
          <Route
            path="/word-lattice-solver"
            element={<WordLatticeSolver />}
          />
          <Route path="/skeleton-solver" element={<SkeletonSolver />} />
          <Route path="/kana-visualizer" element={<KanaVisualizer />} />
          <Route path="/prefecture-regex" element={<PrefectureRegex />} />
          <Route path="/char-shifter" element={<CharShifter />} />
          <Route path="/cube-visualizer" element={<CubeVisualizer />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
