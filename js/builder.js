document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  const saveFlowBtn = document.getElementById('save-flow');
  const testFlowBtn = document.getElementById('test-flow');
  const deleteFlowBtn = document.getElementById('delete-flow');
  const flowNameInput = document.getElementById('flow-name');
  const flowDescriptionInput = document.getElementById('flow-description');
  const stepsContainer = document.getElementById('steps-container');
  const triggerArea = document.getElementById('trigger-area');
  const propertiesPanel = document.getElementById('properties-content');
  
  let currentFlowId = null;
  let currentFlow = {
    name: '',
    description: '',
    trigger: null,
    steps: []
  };
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      // Check for flow ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      currentFlowId = urlParams.get('flowId');
      
      if (currentFlowId) {
        loadFlow(user.uid, currentFlowId);
      }
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
  
  // Load flow from Firestore
  function loadFlow(userId, flowId) {
    db.collection('flows').doc(flowId).get().then((doc) => {
      if (doc.exists && doc.data().userId === userId) {
        currentFlow = doc.data();
        flowNameInput.value = currentFlow.name;
        flowDescriptionInput.value = currentFlow.description || '';
        
        // Render trigger
        if (currentFlow.trigger) {
          renderTrigger(currentFlow.trigger);
        }
        
        // Render steps
        if (currentFlow.steps && currentFlow.steps.length > 0) {
          currentFlow.steps.forEach(step => {
            renderStep(step);
          });
        }
      } else {
        alert('Flow not found or you don\'t have permission to access it');
        window.location.href = 'dashboard.html';
      }
    }).catch((error) => {
      console.error('Error loading flow:', error);
    });
  }
  
  // Save flow to Firestore
  function saveFlow(userId) {
    currentFlow.name = flowNameInput.value;
    currentFlow.description = flowDescriptionInput.value;
    currentFlow.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    if (!currentFlow.name) {
      alert('Please enter a flow name');
      return;
    }
    
    if (!currentFlow.trigger) {
      alert('Please add a trigger to your flow');
      return;
    }
    
    const flowData = {
      ...currentFlow,
      userId: userId
    };
    
    if (currentFlowId) {
      // Update existing flow
      db.collection('flows').doc(currentFlowId).update(flowData)
        .then(() => {
          alert('Flow updated successfully');
        })
        .catch((error) => {
          console.error('Error updating flow:', error);
          alert('Error updating flow');
        });
    } else {
      // Create new flow
      db.collection('flows').add(flowData)
        .then((docRef) => {
          currentFlowId = docRef.id;
          alert('Flow saved successfully');
          window.history.replaceState({}, '', `flow-builder.html?flowId=${currentFlowId}`);
        })
        .catch((error) => {
          console.error('Error saving flow:', error);
          alert('Error saving flow');
        });
    }
  }
  
  // Delete flow
  function deleteFlow() {
    if (!currentFlowId) return;
    
    if (confirm('Are you sure you want to delete this flow?')) {
      db.collection('flows').doc(currentFlowId).delete()
        .then(() => {
          alert('Flow deleted successfully');
          window.location.href = 'dashboard.html';
        })
        .catch((error) => {
          console.error('Error deleting flow:', error);
          alert('Error deleting flow');
        });
    }
  }
  
  // Render trigger
  function renderTrigger(trigger) {
    triggerArea.innerHTML = `
      <div class="trigger-item" data-type="${trigger.type}">
        <span>${getTriggerIcon(trigger.type)}</span>
        ${getTriggerLabel(trigger.type)}
        <button class="edit-trigger">Edit</button>
      </div>
    `;
    
    // Add edit event
    triggerArea.querySelector('.edit-trigger').addEventListener('click', () => {
      showTriggerProperties(trigger);
    });
  }
  
  // Render step
  function renderStep(step, index) {
    const stepElement = document.createElement('div');
    stepElement.className = 'flow-step';
    stepElement.dataset.index = index;
    stepElement.dataset.type = step.type;
    stepElement.innerHTML = `
      <div class="step-header">
        <span>${getStepIcon(step.type)}</span>
        ${getStepLabel(step.type)}
        <button class="edit-step">Edit</button>
        <button class="delete-step">Delete</button>
      </div>
      ${step.type === 'text' ? `<div class="step-preview">${step.content}</div>` : ''}
      ${step.type === 'quick-reply' ? `<div class="step-preview">${step.buttons?.map(b => `<button>${b.label}</button>`).join('') || ''}</div>` : ''}
    `;
    
    // Add edit and delete events
    stepElement.querySelector('.edit-step').addEventListener('click', () => {
      showStepProperties(step, index);
    });
    
    stepElement.querySelector('.delete-step').addEventListener('click', () => {
      deleteStep(index);
    });
    
    stepsContainer.appendChild(stepElement);
  }
  
  // Show trigger properties
  function showTriggerProperties(trigger) {
    let propertiesHTML = '';
    
    switch (trigger.type) {
      case 'keyword':
        propertiesHTML = `
          <h4>Keyword Trigger</h4>
          <div class="form-group">
            <label>Keyword</label>
            <input type="text" id="trigger-keyword" value="${trigger.keyword || ''}">
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="trigger-exact" ${trigger.exactMatch ? 'checked' : ''}>
              Exact match only
            </label>
          </div>
          <button class="btn-primary" id="save-trigger">Save</button>
        `;
        break;
        
      case 'new-chat':
        propertiesHTML = `
          <h4>New Chat Trigger</h4>
          <p>This flow will start when a new chat begins.</p>
          <button class="btn-primary" id="save-trigger">Save</button>
        `;
        break;
        
      case 'button-click':
        propertiesHTML = `
          <h4>Button Click Trigger</h4>
          <div class="form-group">
            <label>Button ID</label>
            <input type="text" id="trigger-button-id" value="${trigger.buttonId || ''}">
          </div>
          <button class="btn-primary" id="save-trigger">Save</button>
        `;
        break;
    }
    
    propertiesPanel.innerHTML = propertiesHTML;
    
    // Add save event
    document.getElementById('save-trigger')?.addEventListener('click', () => {
      const updatedTrigger = { type: trigger.type };
      
      switch (trigger.type) {
        case 'keyword':
          updatedTrigger.keyword = document.getElementById('trigger-keyword').value;
          updatedTrigger.exactMatch = document.getElementById('trigger-exact').checked;
          break;
          
        case 'button-click':
          updatedTrigger.buttonId = document.getElementById('trigger-button-id').value;
          break;
      }
      
      currentFlow.trigger = updatedTrigger;
      renderTrigger(updatedTrigger);
      propertiesPanel.innerHTML = '<p>Select an element to edit its properties</p>';
    });
  }
  
  // Show step properties
  function showStepProperties(step, index) {
    let propertiesHTML = '';
    
    switch (step.type) {
      case 'text':
        propertiesHTML = `
          <h4>Text Message</h4>
          <div class="form-group">
            <label>Message Content</label>
            <textarea id="step-text-content">${step.content || ''}</textarea>
          </div>
          <button class="btn-primary" id="save-step">Save</button>
        `;
        break;
        
      case 'image':
        propertiesHTML = `
          <h4>Image Message</h4>
          <div class="form-group">
            <label>Image URL</label>
            <input type="text" id="step-image-url" value="${step.url || ''}">
          </div>
          <div class="form-group">
            <label>Caption</label>
            <input type="text" id="step-image-caption" value="${step.caption || ''}">
          </div>
          <button class="btn-primary" id="save-step">Save</button>
        `;
        break;
        
      case 'quick-reply':
        propertiesHTML = `
          <h4>Quick Reply</h4>
          <div class="form-group">
            <label>Message</label>
            <input type="text" id="step-qr-message" value="${step.message || ''}">
          </div>
          <div id="qr-buttons-container">
            ${(step.buttons || []).map((button, i) => `
              <div class="qr-button" data-index="${i}">
                <input type="text" value="${button.label}" placeholder="Button label">
                <input type="text" value="${button.value}" placeholder="Button value">
                <button class="delete-qr-btn">Delete</button>
              </div>
            `).join('')}
          </div>
          <button class="btn-secondary" id="add-qr-button">Add Button</button>
          <button class="btn-primary" id="save-step">Save</button>
        `;
        break;
        
      case 'delay':
        propertiesHTML = `
          <h4>Delay</h4>
          <div class="form-group">
            <label>Delay Duration (seconds)</label>
            <input type="number" id="step-delay-duration" value="${step.duration || 5}">
          </div>
          <button class="btn-primary" id="save-step">Save</button>
        `;
        break;
    }
    
    propertiesPanel.innerHTML = propertiesHTML;
    
    // Add button events for quick replies
    if (step.type === 'quick-reply') {
      document.getElementById('add-qr-button')?.addEventListener('click', () => {
        const container = document.getElementById('qr-buttons-container');
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'qr-button';
        buttonDiv.innerHTML = `
          <input type="text" placeholder="Button label">
          <input type="text" placeholder="Button value">
          <button class="delete-qr-btn">Delete</button>
        `;
        container.appendChild(buttonDiv);
        
        buttonDiv.querySelector('.delete-qr-btn').addEventListener('click', () => {
          buttonDiv.remove();
        });
      });
      
      // Add delete events for existing buttons
      document.querySelectorAll('.delete-qr-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          this.parentElement.remove();
        });
      });
    }
    
    // Add save event
    document.getElementById('save-step')?.addEventListener('click', () => {
      const updatedStep = { type: step.type };
      
      switch (step.type) {
        case 'text':
          updatedStep.content = document.getElementById('step-text-content').value;
          break;
          
        case 'image':
          updatedStep.url = document.getElementById('step-image-url').value;
          updatedStep.caption = document.getElementById('step-image-caption').value;
          break;
          
        case 'quick-reply':
          updatedStep.message = document.getElementById('step-qr-message').value;
          updatedStep.buttons = [];
          
          document.querySelectorAll('#qr-buttons-container .qr-button').forEach(buttonDiv => {
            const inputs = buttonDiv.querySelectorAll('input');
            if (inputs[0].value && inputs[1].value) {
              updatedStep.buttons.push({
                label: inputs[0].value,
                value: inputs[1].value
              });
            }
          });
          break;
          
        case 'delay':
          updatedStep.duration = parseInt(document.getElementById('step-delay-duration').value) || 5;
          break;
      }
      
      currentFlow.steps[index] = updatedStep;
      stepsContainer.innerHTML = '';
      currentFlow.steps.forEach((step, i) => {
        renderStep(step, i);
      });
      propertiesPanel.innerHTML = '<p>Select an element to edit its properties</p>';
    });
  }
  
  // Delete step
  function deleteStep(index) {
    currentFlow.steps.splice(index, 1);
    stepsContainer.innerHTML = '';
    currentFlow.steps.forEach((step, i) => {
      renderStep(step, i);
    });
  }
  
  // Helper functions
  function getTriggerIcon(type) {
    switch (type) {
      case 'keyword': return '🔑';
      case 'new-chat': return '💬';
      case 'button-click': return '🖱️';
      default: return '❓';
    }
  }
  
  function getTriggerLabel(type) {
    switch (type) {
      case 'keyword': return 'Keyword Trigger';
      case 'new-chat': return 'New Chat Trigger';
      case 'button-click': return 'Button Click Trigger';
      default: return 'Unknown Trigger';
    }
  }
  
  function getStepIcon(type) {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'quick-reply': return '🔘';
      case 'delay': return '⏱️';
      default: return '❓';
    }
  }
  
  function getStepLabel(type) {
    switch (type) {
      case 'text': return 'Text Message';
      case 'image': return 'Image';
      case 'quick-reply': return 'Quick Reply';
      case 'delay': return 'Delay';
      default: return 'Unknown Step';
    }
  }
  
  // Drag and drop functionality
  document.querySelectorAll('.element, .trigger').forEach(element => {
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('type', element.dataset.type);
    });
  });
  
  // Handle drop on steps container
  stepsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  
  stepsContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    
    if (['text', 'image', 'quick-reply', 'delay'].includes(type)) {
      const newStep = { type };
      currentFlow.steps.push(newStep);
      renderStep(newStep, currentFlow.steps.length - 1);
    }
  });
  
  // Handle drop on trigger area
  triggerArea.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  
  triggerArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    
    if (['keyword', 'new-chat', 'button-click'].includes(type)) {
      const newTrigger = { type };
      currentFlow.trigger = newTrigger;
      renderTrigger(newTrigger);
    }
  });
  
  // Save flow button
  saveFlowBtn.addEventListener('click', () => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        saveFlow(user.uid);
      }
    });
  });
  
  // Delete flow button
  deleteFlowBtn.addEventListener('click', deleteFlow);
  
  // Test flow button (mock functionality)
  testFlowBtn.addEventListener('click', () => {
    alert('This would test the flow in a real implementation');
  });
});
