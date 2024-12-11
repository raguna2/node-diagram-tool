import { Switch, Route } from "wouter";
import FlowEditor from "@/components/FlowEditor";
import { ReactFlowProvider } from 'reactflow';

function App() {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <ReactFlowProvider>
        <Switch>
          <Route path="/" component={FlowEditor} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </ReactFlowProvider>
    </div>
  );
}

export default App;
