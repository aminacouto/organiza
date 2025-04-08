document.addEventListener('DOMContentLoaded', function () {
    // Função para formatar a data no formato dd/mm/aaaa
    function formatarData(isoDate) {
        const [ano, mes, dia] = isoDate.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    // Função para converter data no formato dd/mm/aaaa para aaaa-mm-dd (ISO)
    function converterDataParaISO(data) {
        const [dia, mes, ano] = data.split('/');
        return `${ano}-${mes}-${dia}`;
    }

    // Adicionar método de ordenação personalizada ao DataTables
    $.fn.dataTable.ext.type.order['date-dd-mm-yyyy-pre'] = function (data) {
        const isoDate = converterDataParaISO(data);
        return new Date(isoDate).getTime();
    };

    // Inicializar DataTables
    const tabela = $('#tabela-gastos').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json",
            emptyTable: "Nenhum registro encontrado"
        },
        createdRow: function (row, data, dataIndex) {
            if (dataIndex === -1) {
                $('td', row).eq(1).text("Nenhum registro encontrado");
            }
        },
        columnDefs: [
            {
                targets: 0, // Coluna de data
                type: 'date-dd-mm-yyyy' // Aplicar ordenação personalizada
            }
        ],
        order: [[0, 'asc']] // Ordenar pela coluna de data (índice 0) em ordem crescente
    });

    // Função para carregar dados do localStorage
    function carregarDados() {
        const dadosSalvos = JSON.parse(localStorage.getItem('gastos')) || [];
        dadosSalvos.forEach(dado => {
            adicionarLinha(dado.data, dado.descricao, dado.valor, dado.categoria);
        });
    }

    // Função para salvar dados no localStorage
    function salvarDados(data, descricao, valor, categoria) {
        const dadosSalvos = JSON.parse(localStorage.getItem('gastos')) || [];
        dadosSalvos.push({ data, descricao, valor, categoria });
        localStorage.setItem('gastos', JSON.stringify(dadosSalvos));
    }

    // Função para atualizar o localStorage após exclusão ou edição
    function atualizarLocalStorage() {
        const dadosAtualizados = [];
        tabela.rows().every(function () {
            const data = this.data();
            dadosAtualizados.push({
                data: data[0],
                descricao: data[1],
                valor: data[2],
                categoria: data[3]
            });
        });
        localStorage.setItem('gastos', JSON.stringify(dadosAtualizados));
    }

    // Função para adicionar uma nova linha à tabela
    function adicionarLinha(data, descricao, valor, categoria) {
        tabela.row.add([
            data,
            descricao,
            valor,
            categoria,
            `<button class="editar">Editar</button> <button class="excluir">Excluir</button>`
        ]).draw();
    }

    // Carregar dados ao inicializar a página
    carregarDados();

    // Capturar o formulário
    const form = document.getElementById('form-gastos');

    // Adicionar evento de submissão ao formulário
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Capturar os valores dos campos do formulário
        const dataOriginal = document.getElementById('data').value;
        const dataFormatada = formatarData(dataOriginal);
        const descricao = document.getElementById('descricao').value;
        const valor = parseFloat(document.getElementById('valor').value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const categoria = document.getElementById('categoria').value;

        if (dataOriginal && descricao && valor && categoria) {
            adicionarLinha(dataFormatada, descricao, valor, categoria);
            salvarDados(dataFormatada, descricao, valor, categoria);
            form.reset();
        } else {
            alert('Por favor, preencha todos os campos!');
        }
    });

    // Evento para excluir uma linha
    $('#tabela-gastos tbody').on('click', '.excluir', function () {
        tabela.row($(this).parents('tr')).remove().draw();
        atualizarLocalStorage();
    });

    // Evento para editar uma linha
    $('#tabela-gastos tbody').on('click', '.editar', function () {
        const row = tabela.row($(this).parents('tr'));
        const data = row.data();

        // Converte a data de dd/mm/aaaa para aaaa-mm-dd para preencher no campo input
        const [dia, mes, ano] = data[0].split('/');
        const dataInputFormat = `${ano}-${mes}-${dia}`;

        document.getElementById('data').value = dataInputFormat;
        document.getElementById('descricao').value = data[1];
        document.getElementById('valor').value = parseFloat(data[2].replace(/[^\d,.-]/g, '').replace(',', '.'));
        document.getElementById('categoria').value = data[3];

        row.remove().draw();
        atualizarLocalStorage();
    });
});
