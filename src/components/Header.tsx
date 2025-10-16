import { AppBar, Toolbar, IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { memo } from "react";
import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";

const Header = memo(() => {
  const store = useStore();
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <div
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          My To Do App
        </div>
        <IconButton color="inherit" onClick={() => store.ui.toggleTheme()}>
          <Brightness4Icon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
});

export default Header;
