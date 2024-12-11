import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import FlowEditor from "@/components/FlowEditor";
import { ReactFlowProvider } from 'reactflow';

function App() {
  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor">
          <ReactFlowProvider>
            <FlowEditor />
          </ReactFlowProvider>
        </Route>
        <Route path="/editor/:id">
          <ReactFlowProvider>
            <FlowEditor />
          </ReactFlowProvider>
        </Route>
        <Route>404 Page Not Found</Route>
      </Switch>
    </div>
  );
}

export default App;
