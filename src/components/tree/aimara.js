import expand from './images/expand.png'
import collapse from './images/collapse.png'

/// // Creating the tree component
// pDiv: ID of the div where the tree will be rendered;
// pBackColour: Background color of the region where the tree is being rendered;
// pContextMenu: Object containing all the context menus. Set null for no context menu;
function createTree (pDiv, pBackColour, pContextMenu) {
  var tree = {
    name: 'tree',
    div: pDiv,
    ulElement: null,
    childNodes: [],
    backcolor: pBackColour,
    contextMenu: pContextMenu,
    selectedNode: null,
    nodeCounter: 0,
    contextMenuDiv: null,
    rendered: false,
    /// // Creating a new node
    // pText: Text displayed on the node;
    // pExpanded: True or false, indicating whether the node starts expanded or not;
    // pIcon: Relative path to the icon displayed with the node. Set null if the node has no icon;
    // pParentNode: Reference to the parent node. Set null to create the node on the root;
    // pTag: Tag is used to store additional information on the node. All node attributes are visible when programming events and context menu actions;
    // pContextMenu: Name of the context menu, which is one of the attributes of the pContextMenu object created with the tree;
    createNode: function (pText, pExpanded, pIcon, pParentNode, pTag, pContextMenu) {
      const vTree = this
      const node = {
        id: 'node_' + this.nodeCounter,
        text: pText,
        icon: pIcon,
        parent: pParentNode,
        expanded: pExpanded,
        childNodes: [],
        tag: pTag,
        contextMenu: pContextMenu,
        elementLi: null,
        /// // Removing the node and all its children
        removeNode: function () { vTree.removeNode(this) },
        /// // Expanding or collapsing the node, depending on the expanded value
        toggleNode: function (pEvent) { vTree.toggleNode(this) },
        /// // Expanding the node
        expandNode: function (pEvent) { vTree.expandNode(this) },
        /// // Expanding the node and its children recursively
        expandSubtree: function () { vTree.expandSubtree(this) },
        /// // Changing the node text
        // pText: New text;
        setText: function (pText) { vTree.setText(this, pText) },
        /// // Collapsing the node
        collapseNode: function () { vTree.collapseNode(this) },
        /// // Collapsing the node and its children recursively
        collapseSubtree: function () { vTree.collapseSubtree(this) },
        /// // Deleting all child nodes
        removeChildNodes: function () { vTree.removeChildNodes(this) },
        /// // Creating a new child node;
        // pText: Text displayed;
        // pExpanded: True or false, indicating wether the node starts expanded or not;
        // pIcon: Icon;
        // pTag: Tag;
        // pContextMenu: Context Menu;
        createChildNode: function (pText, pExpanded, pIcon, pTag, pContextMenu) { return vTree.createNode(pText, pExpanded, pIcon, this, pTag, pContextMenu) }
      }

      this.nodeCounter++

      if (this.rendered) {
        if (pParentNode === undefined) {
          this.drawNode(this.ulElement, node)
          this.adjustLines(this.ulElement, false)
        } else {
          var vUl = pParentNode.elementLi.getElementsByTagName('ul')[0]
          if (pParentNode.childNodes.length === 0) {
            if (pParentNode.expanded) {
              pParentNode.elementLi.getElementsByTagName('ul')[0].style.display = 'block'
              const vImg = pParentNode.elementLi.getElementsByTagName('img')[0]
              vImg.style.visibility = 'visible'
              vImg.src = collapse
              vImg.id = 'toggle_off'
            } else {
              pParentNode.elementLi.getElementsByTagName('ul')[0].style.display = 'none'
              const vImg = pParentNode.elementLi.getElementsByTagName('img')[0]
              vImg.style.visibility = 'visible'
              vImg.src = expand
              vImg.id = 'toggle_on'
            }
          }
          this.drawNode(vUl, node)
          this.adjustLines(vUl, false)
        }
      }

      if (pParentNode === undefined) {
        this.childNodes.push(node)
        node.parent = this
      } else { pParentNode.childNodes.push(node) }

      return node
    },

    drawTree: function () {
      this.rendered = true

      var divTree = this.div
      divTree.innerHTML = ''

      const ulElement = createSimpleElement('ul', this.name, 'tree')
      this.ulElement = ulElement

      for (var i = 0; i < this.childNodes.length; i++) {
        this.drawNode(ulElement, this.childNodes[i])
      }

      divTree.appendChild(ulElement)

      this.adjustLines(document.getElementById(this.name), true)
    },
    /// // Drawing the node. This function is used when drawing the Tree and should not be called directly;
    // pUlElement: Reference to the UL tag element where the node should be created;
    // pNode: Reference to the node object;
    drawNode: function (pUlElement, pNode) {
      const vTree = this

      var vIcon = null

      if (pNode.icon !== null) { vIcon = createImgElement(null, 'icon_tree', pNode.icon) }

      var vLi = document.createElement('li')
      pNode.elementLi = vLi

      var vSpan = createSimpleElement('span', null, 'node')

      var vExpCol = null

      if (pNode.childNodes.length === 0) {
        vExpCol = createImgElement('toggle_off', 'exp_col', collapse)
        vExpCol.style.visibility = 'hidden'
      } else {
        if (pNode.expanded) {
          vExpCol = createImgElement('toggle_off', 'exp_col', collapse)
        } else {
          vExpCol = createImgElement('toggle_on', 'exp_col', expand)
        }
      }

      vSpan.ondblclick = function () {
        vTree.doubleClickNode(pNode)
      }

      vExpCol.onclick = function () {
        vTree.toggleNode(pNode)
      }

      vSpan.onclick = function () {
        vTree.selectNode(pNode)
      }

      vSpan.oncontextmenu = function (e) {
        vTree.selectNode(pNode)
        vTree.nodeContextMenu(e, pNode)
      }

      if (vIcon !== undefined) { vSpan.appendChild(vIcon) }

      const vA = createSimpleElement('a', null, null)
      vA.innerHTML = pNode.text
      vSpan.appendChild(vA)
      vLi.appendChild(vExpCol)
      vLi.appendChild(vSpan)

      pUlElement.appendChild(vLi)

      var vUl = createSimpleElement('ul', 'ul_' + pNode.id, null)
      vLi.appendChild(vUl)

      if (pNode.childNodes.length > 0) {
        if (!pNode.expanded) { vUl.style.display = 'none' }

        for (var i = 0; i < pNode.childNodes.length; i++) {
          this.drawNode(vUl, pNode.childNodes[i])
        }
      }
    },
    /// // Changing node text
    // pNode: Reference to the node that will have its text updated;
    // pText: New text;
    setText: function (pNode, pText) {
      pNode.elementLi.getElementsByTagName('span')[0].lastChild.innerHTML = pText
      pNode.text = pText
    },
    /// // Expanding all tree nodes
    expandTree: function () {
      for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].childNodes.length > 0) {
          this.expandSubtree(this.childNodes[i])
        }
      }
    },
    /// // Expanding all nodes inside the subtree that have parameter 'pNode' as root
    // pNode: Subtree root;
    expandSubtree: function (pNode) {
      this.expandNode(pNode)
      for (var i = 0; i < pNode.childNodes.length; i++) {
        if (pNode.childNodes[i].childNodes.length > 0) {
          this.expandSubtree(pNode.childNodes[i])
        }
      }
    },
    /// // Collapsing all tree nodes
    collapseTree: function () {
      for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i].childNodes.length > 0) {
          this.collapseSubtree(this.childNodes[i])
        }
      }
    },
    /// // Collapsing all nodes inside the subtree that have parameter 'pNode' as root
    // pNode: Subtree root;
    collapseSubtree: function (pNode) {
      this.collapseNode(pNode)
      for (var i = 0; i < pNode.childNodes.length; i++) {
        if (pNode.childNodes[i].childNodes.length > 0) {
          this.collapseSubtree(pNode.childNodes[i])
        }
      }
    },
    /// // Expanding node
    // pNode: Reference to the node;
    expandNode: function (pNode) {
      if (pNode.childNodes.length > 0 && !pNode.expanded) {
        if (this.nodeBeforeOpenEvent !== undefined) { this.nodeBeforeOpenEvent(pNode) }

        var img = pNode.elementLi.getElementsByTagName('img')[0]

        pNode.expanded = true

        img.id = 'toggle_off'
        img.src = collapse
        const elemUl = img.parentElement.getElementsByTagName('ul')[0]
        elemUl.style.display = 'block'

        if (this.nodeAfterOpenEvent !== undefined) { this.nodeAfterOpenEvent(pNode) }
      }
    },
    /// // Collapsing node
    // pNode: Reference to the node;
    collapseNode: function (pNode) {
      if (pNode.childNodes.length > 0 && pNode.expanded) {
        var img = pNode.elementLi.getElementsByTagName('img')[0]

        pNode.expanded = false
        if (this.nodeBeforeCloseEvent !== undefined) { this.nodeBeforeCloseEvent(pNode) }

        img.id = 'toggle_on'
        img.src = expand
        const elemUl = img.parentElement.getElementsByTagName('ul')[0]
        elemUl.style.display = 'none'
      }
    },
    /// // Toggling node
    // pNode: Reference to the node;
    toggleNode: function (pNode) {
      if (pNode.childNodes.length > 0) {
        if (pNode.expanded) { pNode.collapseNode() } else { pNode.expandNode() }
      }
    },
    /// // Double clicking node
    // pNode: Reference to the node;
    doubleClickNode: function (pNode) {
      this.toggleNode(pNode)
    },
    /// // Selecting node
    // pNode: Reference to the node;
    selectNode: function (pNode) {
      var span = pNode.elementLi.getElementsByTagName('span')[0]
      span.className = 'node_selected'
      if (this.selectedNode !== null && this.selectedNode !== pNode) { this.selectedNode.elementLi.getElementsByTagName('span')[0].className = 'node' }
      this.selectedNode = pNode
    },
    /// // Deleting node
    // pNode: Reference to the node;
    removeNode: function (pNode) {
      var index = pNode.parent.childNodes.indexOf(pNode)

      if (pNode.elementLi.className === 'last' && index !== 0) {
        pNode.parent.childNodes[index - 1].elementLi.className += 'last'
        pNode.parent.childNodes[index - 1].elementLi.style.backgroundColor = this.backcolor
      }

      pNode.elementLi.parentNode.removeChild(pNode.elementLi)
      pNode.parent.childNodes.splice(index, 1)

      if (pNode.parent.childNodes.length === 0) {
        var vImg = pNode.parent.elementLi.getElementsByTagName('img')[0]
        vImg.style.visibility = 'hidden'
      }
    },
    /// // Deleting all node children
    // pNode: Reference to the node;
    removeChildNodes: function (pNode) {
      if (pNode.childNodes.length > 0) {
        var vUl = pNode.elementLi.getElementsByTagName('ul')[0]

        var vImg = pNode.elementLi.getElementsByTagName('img')[0]
        vImg.style.visibility = 'hidden'

        pNode.childNodes = []
        vUl.innerHTML = ''
      }
    },
    /// // Rendering context menu when mouse right button is pressed over a node. This function should no be called directly
    // pEvent: Event triggered when right clicking;
    // pNode: Reference to the node;
    nodeContextMenu: function (pEvent, pNode) {
      if (pEvent.button === 2) {
        pEvent.preventDefault()
        pEvent.stopPropagation()
        if (pNode.contextMenu !== undefined) {
          const vTree = this

          var vMenu = this.contextMenu[pNode.contextMenu]

          var vDiv
          if (this.contextMenuDiv === null) {
            vDiv = createSimpleElement('ul', 'ul_cm', 'menu')
            document.body.appendChild(vDiv)
          } else { vDiv = this.contextMenuDiv }

          vDiv.innerHTML = ''

          var vLeft = pEvent.pageX - 5
          var vRight = pEvent.pageY - 5

          vDiv.style.display = 'block'
          vDiv.style.position = 'absolute'
          vDiv.style.left = vLeft + 'px'
          vDiv.style.top = vRight + 'px'

          for (var i = 0; i < vMenu.elements.length; i++) {
            (function (i) {
              var vLi = createSimpleElement('li', null, null)

              var vSpan = createSimpleElement('span', null, null)
              vSpan.onclick = function () { vMenu.elements[i].action(pNode) }

              var vA = createSimpleElement('a', null, null)
              var vUl = createSimpleElement('ul', null, 'sub-menu')

              vA.appendChild(document.createTextNode(vMenu.elements[i].text))

              vLi.appendChild(vSpan)

              if (vMenu.elements[i].icon !== undefined) {
                var vImg = createImgElement('null', 'null', vMenu.elements[i].icon)
                vLi.appendChild(vImg)
              }

              vLi.appendChild(vA)
              vLi.appendChild(vUl)
              vDiv.appendChild(vLi)

              if (vMenu.elements[i].submenu !== undefined) {
                var vSpanMore = createSimpleElement('div', null, null)
                vSpanMore.appendChild(createImgElement(null, 'menu_img', 'images/right.png'))
                vLi.appendChild(vSpanMore)
                vTree.contextMenuLi(vMenu.elements[i].submenu, vUl, pNode)
              }
            })(i)
          }

          this.contextMenuDiv = vDiv
        }
      }
    },
    /// // Recursive function called when rendering context menu submenus. This function should no be called directly
    // pSubMenu: Reference to the submenu object;
    // pUl: Reference to the UL tag;
    // pNode: Reference to the node;
    contextMenuLi: function (pSubMenu, pUl, pNode) {
      const vTree = this

      for (var i = 0; i < pSubMenu.elements.length; i++) {
        (function (i) {
          var vLi = createSimpleElement('li', null, null)

          var vSpan = createSimpleElement('span', null, null)
          vSpan.onclick = function () { pSubMenu.elements[i].action(pNode) }

          var vA = createSimpleElement('a', null, null)
          var vUl = createSimpleElement('ul', null, 'sub-menu')

          vA.appendChild(document.createTextNode(pSubMenu.elements[i].text))

          vLi.appendChild(vSpan)

          if (pSubMenu.elements[i].icon !== undefined) {
            var vImg = createImgElement('null', 'null', pSubMenu.elements[i].icon)
            vLi.appendChild(vImg)
          }

          vLi.appendChild(vA)
          vLi.appendChild(vUl)
          pUl.appendChild(vLi)

          if (pSubMenu.elements[i].pSubMenu !== undefined) {
            var vSpanMore = createSimpleElement('div', null, null)
            vSpanMore.appendChild(createImgElement(null, 'menu_img', 'images/right.png'))
            vLi.appendChild(vSpanMore)
            vTree.contextMenuLi(pSubMenu.elements[i].pSubMenu, vUl, pNode)
          }
        })(i)
      }
    },
    /// // Adjusting tree dotted lines. This function should not be called directly
    // pNode: Reference to the node;
    adjustLines: function (pUl, pRecursive) {
      var tree = pUl

      var lists = []

      if (tree.childNodes.length > 0) {
        lists = [tree]

        if (pRecursive) {
          for (let i = 0; i < tree.getElementsByTagName('ul').length; i++) {
            var checkUl = tree.getElementsByTagName('ul')[i]
            if (checkUl.childNodes.length !== 0) { lists[lists.length] = checkUl }
          }
        }
      }

      for (let i = 0; i < lists.length; i++) {
        var item = lists[i].lastChild

        while (!item.tagName || item.tagName.toLowerCase() !== 'li') {
          item = item.previousSibling
        }

        item.className += 'last'
        item.style.backgroundColor = this.backcolor

        item = item.previousSibling

        if (item !== null) {
          if (item.tagName.toLowerCase() === 'li') {
            item.className = ''
            item.style.backgroundColor = 'transparent'
          }
        }
      }
    }
  }

  window.onclick = function () {
    if (tree.contextMenuDiv !== null) { tree.contextMenuDiv.style.display = 'none' }
  }

  return tree
}

// Helper Functions

// Create a HTML element specified by parameter 'pType'
function createSimpleElement (pType, pId, pClass) {
  const element = document.createElement(pType)
  if (pId !== undefined) { element.id = pId }
  if (pClass !== undefined) { element.className = pClass }
  return element
}

function createImgElement (pId, pClass, pSrc) {
  const element = document.createElement('img')
  if (pId !== undefined) { element.id = pId }
  if (pClass !== undefined) { element.className = pClass }
  if (pSrc !== undefined) { element.src = pSrc }
  return element
}

export { createTree }
