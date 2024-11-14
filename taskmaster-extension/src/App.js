import { Routes, Route } from 'react-router-dom';
import TaskList from './TaskList';
import Login from './Login';

function App() {
  return (
    <Routes>
      <Route path="/" exact component={TaskList} />
      <Route path="/login" component={Login} />
    </Routes>
  );
}

export default App;
