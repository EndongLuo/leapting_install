function buildTreeForElTree(data) {
  // 创建虚拟根节点（不返回这个节点）
  const root = {
    id: 'root',
    label: '/',
    name: '',
    children: []
  };
  
  let idCounter = 1;
  
  data.forEach(item => {
    const pathParts = item.name.split('/').filter(part => part !== '');
    let currentNode = root;
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      let childNode = currentNode.children?.find(child => child.name === part);
      
      if (!childNode) {
        childNode = {
          id: `${idCounter++}`,
          label: part,
          name: part,
          fullPath: `/${pathParts.slice(0, i + 1).join('/')}`,
          children: []
        };
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(childNode);
      }
      
      currentNode = childNode;
      
      // 处理/STATUS节点的values
      if (currentNode.fullPath === '/STATUS' && item.values?.length > 0) {
        item.values.forEach(valueItem => {
          const valueNode = {
            id: `${idCounter++}`,
            label: `${valueItem.key}: ${valueItem.value}`,
            name: valueItem.key,
            value: valueItem.value,
            fullPath: `${currentNode.fullPath}/${valueItem.key}`,
            isValueNode: true
          };
          currentNode.children.push(valueNode);
        });
      }
    }
    
    // 处理非/STATUS节点的values
    if (currentNode.fullPath !== '/STATUS' && item.values?.length > 0) {
      item.values.forEach(valueItem => {
        const valueNode = {
          id: `${idCounter++}`,
          label: `${valueItem.key}: ${valueItem.value}`,
          name: valueItem.key,
          value: valueItem.value,
          fullPath: `${currentNode.fullPath}/${valueItem.key}`,
          isValueNode: true
        };
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(valueNode);
      });
    }
  });
  
  // 返回根节点的所有子节点（而不是根节点本身）
  return root.children;
}

 module.exports = {buildTreeForElTree}