import React from "react";
import { observer } from "mobx-react-lite";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useStore } from "./store/useStore";
import BoardListPage from "./pages/BoardListPage";

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
      <BoardListPage />
    </ThemeProvider>
  );
});

export default App;
