import { createTheme } from '@mui/material/styles';

// Palette: bordeaux (primario), oliva (secondario), grigio pietra per le superfici
const theme = createTheme({
  palette: {
    primary: { main: '#6e1a35' },
    secondary: { main: '#6f7a2f' },
    background: { default: '#f4f4f1', paper: '#ffffff' },
    text: { primary: '#26211f' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Public Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
    h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e3e1dc' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
export default theme;
