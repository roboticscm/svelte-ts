export const createTree = (id) => {
  const setting = {
    check: {
      enable: true
    },
    data: {
      simpleData: {
        enable: true
      }
    }
  };

  const data = [
    { id: 1, pId: 0, name: 'pNode 1', open: true },
    { id: 11, pId: 1, name: 'pNode 11' },
    { id: 111, pId: 11, name: 'leaf node 111' },
    { id: 112, pId: 11, name: 'leaf node 112' },
    { id: 113, pId: 11, name: 'leaf node 113' },
    { id: 114, pId: 11, name: 'leaf node 114' },
    { id: 12, pId: 1, name: 'pNode 12' },
    { id: 121, pId: 12, name: 'leaf node 121' },
    { id: 122, pId: 12, name: 'leaf node 122' },
    { id: 123, pId: 12, name: 'leaf node 123' },
    { id: 124, pId: 12, name: 'leaf node 124' },
    { id: 13, pId: 1, name: 'pNode 13 - no child', isParent: true },
    { id: 2, pId: 0, name: 'pNode 2' },
    { id: 21, pId: 2, name: 'pNode 21', open: true },
    { id: 211, pId: 21, name: 'leaf node 211' }
  ];

  j$.fn.zTree.init(j$(id), setting, data);
};
