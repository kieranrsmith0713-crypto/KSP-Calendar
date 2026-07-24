import { AuthGate } from './components/AuthGate';
import { CalendarPage } from './pages/CalendarPage';

function App() {
  return (
    <AuthGate>
      <CalendarPage />
    </AuthGate>
  );
}

export default App;
