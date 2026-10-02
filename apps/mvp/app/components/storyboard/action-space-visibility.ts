import type { ActionChoice, ActionSpaceView } from "./action-space-state";

export function visibleActionChildren(children: ActionChoice[], view: ActionSpaceView, parentId: string) {
  return children.filter((child) => !view.hidden.includes(child.id)
    && (view.included.includes(child.id) || (view.active === parentId && view.expanded.includes(parentId))));
}

export function isVisibleActionLeaf(nodes: ActionChoice[], view: ActionSpaceView, id: string) {
  return visibleActionChildren(nodes.filter((node) => node.parentId === id), view, id).length === 0;
}

export function removeActionBranch(nodes: ActionChoice[], view: ActionSpaceView, id: string): ActionSpaceView {
  const parentId = nodes.find((node) => node.id === id)?.parentId;
  if (!parentId) return view;
  const inBranch = (nodeId: string) => nodeId === id || nodeId.startsWith(`${id}/`);
  const removedFocus = view.focusedNodeId !== null && inBranch(view.focusedNodeId);
  const next: ActionSpaceView = {
    ...view,
    included: view.included.filter((nodeId) => !inBranch(nodeId)),
    expanded: view.expanded.filter((nodeId) => !inBranch(nodeId)),
    hidden: [...view.hidden.filter((nodeId) => !inBranch(nodeId)), id],
    active: view.active && inBranch(view.active) ? null : view.active,
    focusedNodeId: removedFocus ? null : view.focusedNodeId,
    unfocusedViewport: removedFocus ? null : view.unfocusedViewport,
    viewport: removedFocus ? view.unfocusedViewport ?? view.viewport : view.viewport,
  };
  if (view.selectedScenarioLeafId && inBranch(view.selectedScenarioLeafId)) {
    next.selectedScenarioLeafId = isVisibleActionLeaf(nodes, next, parentId) ? parentId : null;
  }
  return next;
}
