import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
  } from "reactflow";
  
  import "reactflow/dist/style.css";
  
  function getNodeColor(type, hasFallacy, isAffected) {
    if (type === "premise") {
      return {
        background: "#dbeafe",
        border: isAffected ? "3px solid #ef4444" : "2px solid #93c5fd",
        color: "#1e40af",
      };
    }
  
    if (type === "assumption") {
      return {
        background: "#fef3c7",
        border: isAffected ? "3px solid #ef4444" : "2px solid #f59e0b",
        color: "#92400e",
      };
    }
  
    if (type === "conclusion") {
      return {
        background: hasFallacy ? "#fee2e2" : "#dcfce7",
        border: hasFallacy ? "3px solid #ef4444" : "2px solid #22c55e",
        color: hasFallacy ? "#991b1b" : "#166534",
      };
    }
  
    if (type === "fallacy") {
      return {
        background: "#fee2e2",
        border: "3px solid #ef4444",
        color: "#991b1b",
      };
    }
  
    return {
      background: "#f8fafc",
      border: "2px solid #cbd5e1",
      color: "#334155",
    };
  }
  
  function getNodePosition(node, index, totalPremises, totalAssumptions) {
    if (node.type === "premise") {
      return {
        x: 80,
        y: 70 + index * 140,
      };
    }
  
    if (node.type === "assumption") {
      return {
        x: 380,
        y: 70 + totalPremises * 70 + index * 140,
      };
    }
  
    if (node.type === "conclusion") {
      return {
        x: 720,
        y: 140 + totalAssumptions * 50,
      };
    }
  
    return {
      x: 380,
      y: 80 + index * 140,
    };
  }
  
  function createNodeLabel(node) {
    return (
      <div className="logic-node-content">
        <strong>{node.label}</strong>
        <span>{node.text}</span>
      </div>
    );
  }
  
  function LogicGraph({ analysis }) {
    if (!analysis) {
      return (
        <div className="graph-placeholder polished-placeholder">
          <div className="placeholder-node premise">Premise A</div>
          <div className="placeholder-arrow">→</div>
          <div className="placeholder-node assumption">Assumption</div>
          <div className="placeholder-arrow">→</div>
          <div className="placeholder-node conclusion">Conclusion</div>
        </div>
      );
    }
  
    const hasFallacy = analysis.fallacy?.detected === true;
    const affectedNodes = analysis.fallacy?.affected_nodes || [];
  
    const graphNodes = analysis.graph_nodes || [];
    const graphEdges = analysis.graph_edges || [];
  
    const validNodeIds = graphNodes.map((node) => node.id);
  
    // Safety filter: removes AI-generated edges that point to missing node IDs.
    const safeGraphEdges = graphEdges.filter((edge) => {
      return validNodeIds.includes(edge.source) && validNodeIds.includes(edge.target);
    });
  
    const premiseNodes = graphNodes.filter((node) => node.type === "premise");
    const assumptionNodes = graphNodes.filter((node) => node.type === "assumption");
  
    const reactFlowNodes = graphNodes.map((node, index) => {
      const isAffected = affectedNodes.includes(node.id);
  
      let typeIndex = index;
  
      if (node.type === "premise") {
        typeIndex = premiseNodes.findIndex((item) => item.id === node.id);
      }
  
      if (node.type === "assumption") {
        typeIndex = assumptionNodes.findIndex((item) => item.id === node.id);
      }
  
      return {
        id: node.id,
        position: getNodePosition(
          node,
          typeIndex,
          premiseNodes.length,
          assumptionNodes.length
        ),
        data: {
          label: createNodeLabel(node),
        },
        style: {
          width: 240,
          minHeight: 92,
          padding: 12,
          borderRadius: 18,
          fontSize: 13,
          fontWeight: 600,
          textAlign: "left",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.14)",
          ...getNodeColor(node.type, hasFallacy, isAffected),
        },
      };
    });
  
    const reactFlowEdges = safeGraphEdges.map((edge) => {
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          stroke: "#334155",
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "#334155",
          fontWeight: 700,
        },
        labelBgStyle: {
          fill: "#ffffff",
        },
      };
    });
  
    if (hasFallacy) {
      reactFlowNodes.push({
        id: "fallacy-warning",
        position: {
          x: 720,
          y: 330,
        },
        data: {
          label: (
            <div className="logic-node-content">
              <strong>Fallacy Warning</strong>
              <span>{analysis.fallacy.name}</span>
              <small>{analysis.fallacy.explanation}</small>
            </div>
          ),
        },
        style: {
          width: 290,
          minHeight: 120,
          padding: 12,
          borderRadius: 18,
          fontSize: 13,
          fontWeight: 600,
          textAlign: "left",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.14)",
          ...getNodeColor("fallacy", hasFallacy, true),
        },
      });
  
      affectedNodes.forEach((nodeId, index) => {
        if (!validNodeIds.includes(nodeId)) return;
  
        reactFlowEdges.push({
          id: `fallacy-edge-${index}`,
          source: nodeId,
          target: "fallacy-warning",
          label: "weakens",
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            stroke: "#ef4444",
            strokeWidth: 2,
          },
          labelStyle: {
            fill: "#991b1b",
            fontWeight: 800,
          },
          labelBgStyle: {
            fill: "#ffffff",
          },
        });
      });
    }
  
    return (
      <div className="logic-graph-wrapper">
        <ReactFlow nodes={reactFlowNodes} edges={reactFlowEdges} fitView>
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    );
  }
  
  export default LogicGraph;