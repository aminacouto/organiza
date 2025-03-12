document.addEventListener('DOMContentLoaded', function () {
    loadEntries(); // Carregar as entradas ao carregar a página
});

// Ao submeter o formulário, adicionar a entrada ao localStorage e atualizar a tabela
document.getElementById('entryForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Captura os dados do formulário
    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    // Cria um objeto de entrada com os dados do formulário
    const entry = {
        id: Date.now(),  // ID único com timestamp
        type,
        description,
        amount
    };

    // Salva a entrada no localStorage
    saveEntry(entry);

    // Adiciona a entrada na tabela
    addEntryToTable(entry);

    // Limpa o formulário após enviar
    document.getElementById('entryForm').reset();
});

// Função para salvar a entrada no localStorage
function saveEntry(entry) {
    let entries = JSON.parse(localStorage.getItem('entries')) || []; // Carregar as entradas salvas ou um array vazio
    entries.push(entry); // Adiciona a nova entrada
    localStorage.setItem('entries', JSON.stringify(entries)); // Salva no localStorage
}

// Função para carregar as entradas do localStorage e exibi-las na tabela
function loadEntries() {
    let entries = JSON.parse(localStorage.getItem('entries')) || []; // Carregar entradas do localStorage ou array vazio
    entries.forEach(entry => addEntryToTable(entry)); // Adicionar cada entrada à tabela
}

// Função para adicionar uma entrada à tabela
function addEntryToTable(entry) {
    const tableBody = document.getElementById('entriesTableBody');
    const newRow = document.createElement('tr');
    newRow.dataset.id = entry.id; // Associando ID à linha

    newRow.innerHTML = `
        <td>${entry.type}</td>
        <td>${entry.description}</td>
        <td>R$ ${entry.amount.toFixed(2)}</td>
        <td>
            <button onclick="editEntry(${entry.id})">Editar</button>
            <button onclick="deleteEntry(${entry.id})">Excluir</button>
        </td>
    `;

    tableBody.appendChild(newRow); // Adiciona a nova linha na tabela
}

// Função para editar uma entrada
function editEntry(id) {
    let entries = JSON.parse(localStorage.getItem('entries')) || [];
    let entry = entries.find(e => e.id === id);

    if (entry) {
        document.getElementById('type').value = entry.type;
        document.getElementById('description').value = entry.description;
        document.getElementById('amount').value = entry.amount;

        // Remove a entrada do localStorage para ser substituída após edição
        entries = entries.filter(e => e.id !== id);
        localStorage.setItem('entries', JSON.stringify(entries));

        // Remove da tabela
        document.querySelector(`[data-id="${id}"]`).remove();
    }
}

// Função para excluir uma entrada
function deleteEntry(id) {
    let entries = JSON.parse(localStorage.getItem('entries')) || [];
    entries = entries.filter(e => e.id !== id); // Filtra a entrada excluída
    localStorage.setItem('entries', JSON.stringify(entries)); // Salva novamente no localStorage

    // Remove da tabela
    document.querySelector(`[data-id="${id}"]`).remove();
}

// Função para atualizar a tabela após edição ou exclusão
function updateTable() {
    const tableBody = document.getElementById('entriesTableBody');
    loadEntries(); // Recarrega as entradas
}
