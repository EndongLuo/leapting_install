// 数据转换方法
    function convertToTree(data) {
      const root = { name: 'root', children: [] };
      const pathMap = { '': root };
      
      data.forEach(item => {
        const parts = item.name.split('/').filter(part => part !== '');
        let parentPath = '';
        
        parts.forEach(part => {
          const currentPath = parentPath + '/' + part;
          
          if (!pathMap[currentPath]) {
            const newNode = {
              name: part,
              label: currentPath,
              children: []
            };
            
            if (!pathMap[parentPath]) {
              pathMap[parentPath] = { name: parentPath.split('/').pop() || '', children: [] };
              root.children.push(pathMap[parentPath]);
            }
            
            pathMap[parentPath].children.push(newNode);
            pathMap[currentPath] = newNode;
          }
          
          parentPath = currentPath;
        });
        
        const currentNode = pathMap[item.name];
        if (currentNode) {
          item.values.forEach(valueItem => {
            currentNode.children.push({
              name: valueItem.key,
              value: valueItem.value,
              label: `${item.name}/${valueItem.key}`
            });
          });
        }
      });
      
      return root.children;
    }

    module.exports = { convertToTree } 