$(document).ready(function () {

    /* =========================
       FORMATADORES
    ========================== */

    function formatarData(isoDate) {
        const [ano, mes, dia] = isoDate.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function converterDataParaISO(data) {
        const [dia, mes, ano] = data.split('/');
        return `${ano}-${mes}-${dia}`;
    }

    /* =========================
       ORDENAÇÃO DATA TABLE
    ========================== */

    $.fn.dataTable.ext.type.order['date-dd-mm-yyyy-pre'] = function (data) {
        return new Date(converterDataParaISO(data)).getTime();
    };

    /* =========================
       DATATABLE
    ========================== */

    const tabela = $('#tabela-gastos').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json"
        },
        columnDefs: [{
            targets: 0,
            type: 'date-dd-mm-yyyy'
        }],
        order: [[0, 'asc']]
    });

    /* =========================
       POPULAR ANOS AUTOMATICAMENTE
    ========================== */

    function popularAnos() {

        let dadosSalvos = JSON.parse(localStorage.getItem('gastos'));

        if (!Array.isArray(dadosSalvos)) return;

        const selectAno = document.getElementById('filtro-ano');

        selectAno.innerHTML =
            '<option value="todos">Todos</option>';

        const anos = new Set();

        dadosSalvos.forEach(dado => {
            const ano = dado.data.split('/')[2];
            anos.add(ano);
        });

        [...anos].sort().forEach(ano => {
            selectAno.innerHTML +=
                `<option value="${ano}">${ano}</option>`;
        });
    }

    /* =========================
       CARREGAR DADOS (MÊS + ANO)
    ========================== */

    function carregarDados() {

        tabela.clear();

        let dadosSalvos = JSON.parse(localStorage.getItem('gastos'));

        if (!Array.isArray(dadosSalvos)) {
            dadosSalvos = [];
        }

        const mesSelecionado =
            document.getElementById('filtro-mes').value;

        const anoSelecionado =
            document.getElementById('filtro-ano').value;

        dadosSalvos.forEach(dado => {

            const [dia, mes, ano] = dado.data.split('/');

            const filtroMesOK =
                mesSelecionado === "todos" || mes === mesSelecionado;

            const filtroAnoOK =
                anoSelecionado === "todos" || ano === anoSelecionado;

            if (filtroMesOK && filtroAnoOK) {
                adicionarLinha(
                    dado.data,
                    dado.descricao,
                    Number(dado.valor),
                    dado.categoria
                );
            }
        });

        tabela.draw(false);
    }

    /* =========================
       SALVAR DADOS
    ========================== */

    function salvarDados(data, descricao, valor, categoria) {

        let dadosSalvos = JSON.parse(localStorage.getItem('gastos'));

        if (!Array.isArray(dadosSalvos)) {
            dadosSalvos = [];
        }

        dadosSalvos.push({ data, descricao, valor, categoria });

        localStorage.setItem('gastos', JSON.stringify(dadosSalvos));
    }

    /* =========================
       ATUALIZAR STORAGE
    ========================== */

    function atualizarLocalStorage() {

        const dadosAtualizados = [];

        tabela.rows().every(function () {

            const rowData = this.data();

            const valorNumero = parseFloat(
                rowData[2]
                    .replace(/[^\d,]/g, '')
                    .replace(',', '.')
            );

            dadosAtualizados.push({
                data: rowData[0],
                descricao: rowData[1],
                valor: valorNumero,
                categoria: rowData[3]
            });
        });

        localStorage.setItem('gastos',
            JSON.stringify(dadosAtualizados));
    }

    /* =========================
       ADICIONAR LINHA
    ========================== */

    function adicionarLinha(data, descricao, valor, categoria) {

        const valorFormatado = valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        tabela.row.add([
            data,
            descricao,
            valorFormatado,
            categoria,
            `<button class="editar">Editar</button>
             <button class="excluir">Excluir</button>`
        ]);
    }

    /* =========================
       FILTROS
    ========================== */

    document.getElementById('filtro-mes')
        .addEventListener('change', carregarDados);

    document.getElementById('filtro-ano')
        .addEventListener('change', carregarDados);

    /* =========================
       INIT
    ========================== */

    popularAnos();
    carregarDados();

    /* =========================
       FORMULÁRIO
    ========================== */

    const form = document.getElementById('form-gastos');

    form.addEventListener('submit', function (event) {

        event.preventDefault();

        const dataOriginal =
            document.getElementById('data').value;

        const descricao =
            document.getElementById('descricao').value;

        const valor =
            parseFloat(document.getElementById('valor').value);

        const categoria =
            document.getElementById('categoria').value;

        if (!dataOriginal || !descricao || !valor || !categoria) {
            alert('Preencha todos os campos!');
            return;
        }

        const dataFormatada = formatarData(dataOriginal);

        salvarDados(dataFormatada, descricao, valor, categoria);

        popularAnos();
        carregarDados();

        form.reset();
    });

    /* =========================
       EXCLUIR
    ========================== */

    $('#tabela-gastos tbody').on('click', '.excluir', function () {
        tabela.row($(this).parents('tr')).remove();
        atualizarLocalStorage();
        popularAnos();
        carregarDados();
    });

    /* =========================
       EDITAR
    ========================== */

    $('#tabela-gastos tbody').on('click', '.editar', function () {

        const row = tabela.row($(this).parents('tr'));
        const data = row.data();

        const [dia, mes, ano] = data[0].split('/');

        document.getElementById('data').value =
            `${ano}-${mes}-${dia}`;

        document.getElementById('descricao').value = data[1];

        document.getElementById('valor').value =
            parseFloat(
                data[2]
                    .replace(/[^\d,.-]/g, '')
                    .replace(',', '.')
            );

        document.getElementById('categoria').value = data[3];

        row.remove();
        atualizarLocalStorage();
        popularAnos();
        carregarDados();
    });

});