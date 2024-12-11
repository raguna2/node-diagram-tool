import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Database } from 'lucide-react';
import Header from '@/components/Header';

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
}

interface Edge {
  source: string;
  target: string;
}

export default function D3FlowEditor() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.append('g');

    // ズームの設定
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // ノードの描画
    const nodeGroups = g.selectAll('.node')
      .data(nodes, (d: any) => d.id)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // ノードの円の描画
    nodeGroups.append('circle')
      .attr('r', 40)
      .attr('fill', 'white')
      .attr('stroke', '#000066')
      .attr('stroke-width', 2);

    // データベースアイコンの描画
    nodeGroups.each(function() {
      const group = d3.select(this);
      const foreignObject = group.append('foreignObject')
        .attr('width', 40)
        .attr('height', 40)
        .attr('x', -20)
        .attr('y', -20);

      const div = foreignObject.append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center');

      // Lucideアイコンのレンダリング
      const icon = document.createElement('div');
      icon.innerHTML = Database({ className: 'h-10 w-10 text-[#000066]' }).outerHTML;
      div.node().appendChild(icon);
    });

    // ラベルの描画
    nodeGroups.append('text')
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs text-[#000066] font-medium')
      .text((d) => d.label);

    // ドラッグの設定
    const drag = d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);

    nodeGroups.call(drag as any);

    function dragstarted(event: any, d: Node) {
      d3.select(this).raise().classed('active', true);
    }

    function dragged(event: any, d: Node) {
      d3.select(this)
        .attr('transform', `translate(${event.x},${event.y})`);
      d.x = event.x;
      d.y = event.y;
      updateEdges();
    }

    function dragended(event: any, d: Node) {
      d3.select(this).classed('active', false);
      setNodes(nodes.map(node => 
        node.id === d.id ? { ...node, x: event.x, y: event.y } : node
      ));
    }

    // エッジの描画と更新
    function updateEdges() {
      const edgeGroups = g.selectAll('.edge')
        .data(edges)
        .join('g')
        .attr('class', 'edge');

      const line = d3.line()
        .curve(d3.curveBasis);

      edgeGroups.selectAll('path')
        .data(d => {
          const source = nodes.find(n => n.id === d.source);
          const target = nodes.find(n => n.id === d.target);
          if (!source || !target) return [];
          return [{
            path: line([
              [source.x, source.y],
              [target.x, target.y]
            ])
          }];
        })
        .join('path')
        .attr('d', d => d.path)
        .attr('stroke', '#000066')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '5,5');
    }

    updateEdges();

    return () => {
      svg.selectAll('*').remove();
    };
  }, [nodes, edges]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 h-full">
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{
              cursor: 'grab',
              touchAction: 'none'
            }}
          />
        </div>
        {/* DescriptionPanel component can be added here */}
      </div>
    </div>
  );
}
