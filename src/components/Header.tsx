import { AppBar, Toolbar, IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { useStore } from "../store/useStore";

const Header = () => {
  const store = useStore();

  return (
    <AppBar position="static">
      <Toolbar>
        <div style={{ flex: 1 }}>My To Do App</div>
        <IconButton color="inherit" onClick={() => store.ui.toggleTheme()}>
          <Brightness4Icon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
