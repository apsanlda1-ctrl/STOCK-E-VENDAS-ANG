class App {
    constructor() {
        this.secaoAtual = 'dashboard';
        this.init();
    }

    init() {
        this.atualizarData();
        this.mudarSecao('dashboard');
    }

    atualizarData() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dataEl = document.getElementById('data-atual');
        if (dataEl) {
            dataEl.innerText = new Date().toLocaleDateString('pt-AO', options);
        }
    }

    formatarKwanza(valor) {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor);
    }

    mudarSecao(secao) {
        this.secaoAtual = secao;
        const titulos = {
            dashboard: 'Dashboard Geral',
            stock: 'Gestão de Stock e Produtos',
            faturacao: 'Emissão de Faturas',
            clientes: 'Gestão de Clientes'
        };
        const tituloEl = document.getElementById('titulo-secao');
        if (tituloEl) {
            tituloEl.innerText = titulos[secao] || 'Sistema';
        }
        this.renderizarSecao();
    }

    renderizarSecao() {
        const container = document.getElementById('conteudo-principal');
        if (!container) return;
        
        if (this.secaoAtual === 'dashboard') {
            const produtos = DB.carregar('produtos');
            const clientes = DB.carregar('clientes');
            const faturas = DB.carregar('faturas');
            const valorTotalStock = produtos.reduce((acc, p) => acc + (p.precoCusto * p.stock), 0);
            
            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p class="text-sm text-gray-500 font-medium">Total de Produtos</p>
                        <h3 class="text-3xl font-bold text-gray-800 mt-2">${produtos.length}</h3>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p class="text-sm text-gray-500 font-medium">Valor em Stock (Custo)</p>
                        <h3 class="text-3xl font-bold text-emerald-600 mt-2">${this.formatarKwanza(valorTotalStock)}</h3>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p class="text-sm text-gray-500 font-medium">Clientes Registados</p>
                        <h3 class="text-3xl font-bold text-blue-600 mt-2">${clientes.length}</h3>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p class="text-sm text-gray-500 font-medium">Faturas Emitidas</p>
                        <h3 class="text-3xl font-bold text-indigo-600 mt-2">${faturas.length}</h3>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-semibold mb-2">Visão Geral do Sistema</h3>
                    <p class="text-gray-600 text-sm">Sistema configurado em Kwanzas (AOA) pronto para gerir inventário, emitir faturas e controlar clientes.</p>
                </div>
            `;
        } else if (this.secaoAtual === 'stock') {
            const produtos = DB.carregar('produtos');
            let html = `
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold">Lista de Produtos em Stock</h3>
                    <button onclick="app.abrirModalProduto()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Novo Produto</button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th class="p-4">Código</th>
                                <th class="p-4">Nome do Produto</th>
                                <th class="p-4">Preço Custo</th>
                                <th class="p-4">Preço Venda</th>
                                <th class="p-4">Stock</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 text-sm">
            `;
            if (produtos.length === 0) {
                html += `<tr><td colspan="5" class="p-6 text-center text-gray-500">Nenhum produto registado.</td></tr>`;
            } else {
                produtos.forEach(p => {
                    html += `
                        <tr>
                            <td class="p-4 font-medium text-gray-900">${p.codigo}</td>
                            <td class="p-4 text-gray-700">${p.nome}</td>
                            <td class="p-4 text-gray-700">${this.formatarKwanza(p.precoCusto)}</td>
                            <td class="p-4 font-semibold text-emerald-600">${this.formatarKwanza(p.precoVenda)}</td>
                            <td class="p-4"><span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">${p.stock} un</span></td>
                        </tr>
                    `;
                });
            }
            html += `</tbody></table></div>`;
            container.innerHTML = html;
        } else if (this.secaoAtual === 'faturacao') {
            container.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-semibold mb-4">Emissão de Fatura / Venda</h3>
                    <p class="text-gray-600 text-sm mb-6">Selecione o cliente e adicione os produtos para calcular o total em Kwanzas com IVA incluído (14%).</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <select id="fatura-cliente" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
                                ${DB.carregar('clientes').map(c => `<option value="${c.id}">${c.nome} (NIF: ${c.nif})</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                            <select id="fatura-produto" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
                                ${DB.carregar('produtos').map(p => `<option value="${p.id}">${p.nome} - ${this.formatarKwanza(p.precoVenda)} (Stock: ${p.stock})</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button onclick="alert('Módulo de carrinho em expansão!')" class="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Adicionar à Fatura</button>
                    </div>
                </div>
            `;
        } else if (this.secaoAtual === 'clientes') {
            const clientes = DB.carregar('clientes');
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold">Lista de Clientes</h3>
                    <button onclick="alert('Formulário de cliente em breve')" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition">+ Novo Cliente</button>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th class="p-4">Nome / Empresa</th>
                                <th class="p-4">NIF</th>
                                <th class="p-4">Contacto</th>
                                <th class="p-4">Morada</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 text-sm">
                            ${clientes.map(c => `
                                <tr>
                                    <td class="p-4 font-medium text-gray-900">${c.nome}</td>
                                    <td class="p-4 text-gray-700">${c.nif}</td>
                                    <td class="p-4 text-gray-700">${c.telefone}</td>
                                    <td class="p-4 text-gray-700">${c.morada}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    abrirModalProduto() {
        const codigo = prompt("Código do Produto (ex: P003):");
        if (!codigo) return;
        const nome = prompt("Nome do Produto:");
        if (!nome) return;
        const precoCusto = parseFloat(prompt("Preço de Custo (AOA):") || 0);
        const precoVenda = parseFloat(prompt("Preço de Venda (AOA):") || 0);
        const stock = parseInt(prompt("Quantidade em Stock:") || 0);

        const produtos = DB.carregar('produtos');
        produtos.push({
            id: Date.now(),
            codigo,
            nome,
            precoCusto,
            precoVenda,
            stock,
            iva: 14
        });
        DB.guardar('produtos', produtos);
        this.renderizarSecao();
    }
}

const app = new App();
