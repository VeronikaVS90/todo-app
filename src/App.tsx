import React from "react";
import { observer } from "mobx-react-lite";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "./store/useStore";
import BoardListPage from "./pages/BoardListPage";
import { BoardPage } from "./pages/BoardPage";
import Header from "./components/Header";

const App = observer(() => {
  const { ui } = useStore();

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: ui.darkMode ? "dark" : "light" },
      }),
    [ui.darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<BoardListPage />} />

          <Route path="/boards/:boardId" element={<BoardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
});

export default App;
