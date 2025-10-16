import React, { Suspense, lazy } from "react";
import { observer } from "mobx-react-lite";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Box,
} from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useStore } from "./store/useStore";
import Header from "./components/Header";

const BoardListPage = lazy(() => import("./pages/BoardListPage"));
const BoardPage = lazy(() => import("./pages/BoardPage"));

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
        <Suspense
          fallback={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<BoardListPage />} />
            <Route path="/boards/:boardId" element={<BoardPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
});

export default App;
