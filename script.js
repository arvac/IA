// Global State
let currentView = 'view-welcome';
let currentTabIdx = 0;
const tabs = ['tab-cliente', 'tab-producto', 'tab-firmas', 'tab-beneficiarios'];

// DOM Elements
const views = document.querySelectorAll('.view-container');
const header = document.getElementById('appHeader');
const tabContents = document.querySelectorAll('.tab-pane');
const tabTriggers = document.querySelectorAll('.tab');
const pageIndicator = document.getElementById('currentPg');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log("Banco Bolivariano Prototype Initialized");
});

// Navigation Function
function navigateTo(viewId) {
    // Hide all views
    views.forEach(v => v.style.display = 'none');
    
    // Show target view
    const target = document.getElementById(viewId);
    if(target) {
        if(viewId === 'view-welcome') {
            target.style.display = 'flex';
            header.style.display = 'none'; // Hide header on splash
        } else {
            target.style.display = 'block';
            header.style.display = 'flex'; // Show header elsewhere
            
            // Adjust header title based on view
            if(viewId === 'view-forms') {
                document.getElementById('headerTitle').innerText = 'Formulario Ingreso/Actualización de Información del Cliente';
                // Reset to first tab when entering forms
                switchTab('tab-cliente', tabTriggers[0]);
            } else if (viewId === 'view-dashboard') {
                document.getElementById('headerTitle').innerText = 'Ingreso de Solicitudes';
            }
        }
    }
    currentView = viewId;
}

// Tab Switching Function
function switchTab(tabId, triggerEl) {
    // Hide all tab panes
    tabContents.forEach(pane => pane.style.display = 'none');
    // Remove active class from all triggers
    tabTriggers.forEach(trigger => trigger.classList.remove('active'));
    
    // Show active pane and set active trigger
    document.getElementById(tabId).style.display = 'block';
    
    if(triggerEl) {
        triggerEl.classList.add('active');
    } else {
        // Find trigger by matching text if element not explicitly passed
        // This is safe assuming simple index match for next/prev
        const idx = tabs.indexOf(tabId);
        if(idx !== -1 && tabTriggers[idx]) {
            tabTriggers[idx].classList.add('active');
        }
    }

    // Update state and pagination number
    currentTabIdx = tabs.indexOf(tabId);
    pageIndicator.innerText = (currentTabIdx + 1);
}

// Next Tab Sequence
function nextTab() {
    if(currentTabIdx < tabs.length - 1) {
        currentTabIdx++;
        switchTab(tabs[currentTabIdx]);
    }
}

// Prev Tab Sequence
function prevTab() {
    if(currentTabIdx > 0) {
        currentTabIdx--;
        switchTab(tabs[currentTabIdx]);
    }
}

// Simple dynamic row add (demonstration purpose)
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const table = this.closest('.form-row')?.nextElementSibling;
        if(table && table.tagName === 'TABLE' && table.classList.contains('small-table')) {
            const tbody = table.querySelector('tbody');
            if(tbody) {
                // Clone the first row as a template
                const newRow = tbody.rows[0].cloneNode(true);
                // Clear input values if any were present (these are static TD's in mock but good practice)
                Array.from(newRow.cells).forEach(cell => {
                    if(!cell.classList.contains('actions-cell')) {
                        cell.innerText = ""; // Empty out content
                    }
                });
                
                // Add the action cell HTML to the last cell if it's missing
                const lastCell = newRow.cells[newRow.cells.length - 1];
                if(lastCell && !lastCell.classList.contains('actions-cell')) {
                     // The empty template row might not have action buttons, add them
                     newRow.cells[newRow.cells.length - 1].classList.add('actions-cell', 'text-center', 'p-0');
                     newRow.cells[newRow.cells.length - 1].innerHTML = '<i class="fa-solid fa-pen action-icon mt-1"></i> <i class="fa-solid fa-trash btn-delete mt-1"></i>';
                }
                
                tbody.appendChild(newRow);
                
                // Attach delete event to new trash icons
                const newTrash = newRow.querySelector('.btn-delete');
                if(newTrash) {
                    newTrash.addEventListener('click', function() {
                       this.closest('tr').remove();
                    });
                }
            }
        }
    });
});

// Delegated event for existing delete buttons in dynamic tables
document.addEventListener('click', function(e) {
    if(e.target && e.target.classList.contains('btn-delete') && e.target.closest('.small-table')) {
         e.target.closest('tr').remove();
    }
    
    // Allow deleting items in the main dashboard table too, with confirmation
    if(e.target && e.target.classList.contains('btn-delete') && e.target.closest('.data-table') && !e.target.closest('.small-table')) {
         if(confirm("¿Está seguro que desea eliminar esta solicitud?")) {
             e.target.closest('tr').remove();
         }
    }
});
