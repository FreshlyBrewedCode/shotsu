import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { HomePage } from "./pages/HomePage";
import { MePage } from "./pages/MePage";
import { MeSetPage } from "./pages/MeSetPage";
import { SetsPage } from "./pages/SetsPage";
import { PublishedProfilePage } from "./pages/PublishedProfilePage";
import { PublishedSetPage } from "./pages/PublishedSetPage";
import { ViewPage } from "./pages/ViewPage";
import { ViewSetPage } from "./pages/ViewSetPage";
import { ViewSetsPage } from "./pages/ViewSetsPage";
import { LocalLayout } from "./local/LocalLayout";
import { ScrollToTop } from "./components/scroll-to-top";

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<LocalLayout />}>
            <Route path="/me" element={<MePage />} />
            <Route path="/me/sets/:id" element={<MeSetPage />} />
            <Route path="/sets" element={<SetsPage />} />
          </Route>
          <Route path="/p/:username" element={<PublishedProfilePage />} />
          <Route path="/p/:username/sets/:id" element={<PublishedSetPage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/view/sets" element={<ViewSetsPage />} />
          <Route path="/view/sets/:id" element={<ViewSetPage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
