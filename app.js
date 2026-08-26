class App {
    constructor() {
        this.secaoAtual = 'dashboard';
        this.carrinhoVenda = [];
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
        return new Intl.NumberFormat('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor) + ' Kz';
    }

    mudarSecao(secao) {
        this.secaoAtual = secao;
        
        // Atualizar estilos visuais dos botões do menu
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-md', 'shadow-emerald-900/20');
        });
        const ativo = document.getElementById(`nav-${secao}`);
        if (ativo) {
            ativo.classList.add('bg-emerald-600', 'text-white', 'shadow-md', 'shadow-emerald-900/20');
        }

        const titulos = {
            dashboard: 'Dashboard Executivo',
            stock: 'Gestão de Inventário e Stock',
            faturacao: 'POS & Emissão de Faturas',
            clientes: 'Gestão de Clientes e NIF'
        };
        const tituloEl = document.getElementById('titulo-secao');
        if (tituloEl) tituloEl.innerText = titulos[secao] || 'Sistema';

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
            const totalVendas = faturas.reduce((acc, f) => acc + f.totalGeral, 0);
            const stockBaixo = produtos.filter(p => p.stock <= 5).length;
            
            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Produtos</p>
                            <h3 class="text-3xl font-bold text-slate-800 mt-2">${produtos.length}</h3>
                            <span class="text-xs text-slate-500 mt-1 block">${stockBaixo} com stock crítico</span>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">📦</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor em Stock (Custo)</p>
                            <h3 class="text-2xl font-bold text-emerald-600 mt-2">${this.formatarKwanza(valorTotalStock)}</h3>
                            <span class="text-xs text-slate-500 mt-1 block">Avaliação interna</span>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">💰</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume de Vendas</p>
                            <h3 class="text-2xl font-bold text-indigo-600 mt-2">${this.formatarKwanza(totalVendas)}</h3>
                            <span class="text-xs text-slate-500 mt-1 block">${faturas.length} faturas emitidas</span>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">📈</div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Ativos</p>
                            <h3 class="text-3xl font-bold text-slate-800 mt-2">${clientes.length}</h3>
                            <span class="text-xs text-slate-500 mt-1 block">Registo com NIF</span>
                        </div>
                        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">👥</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">⚠️ Alertas de Stock Baixo</h3>
                        <div class="divide-y divide-slate-100">
                            ${produtos.filter(p => p.stock <= 5).map(p => `
                                <div class="py-3 flex justify-between items-center text-sm">
                                    <span class="font-medium text-slate-700">${p.nome}</span>
                                    <span class="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">${p.stock} unidades</span>
                                </div>
                            `).join('') || '<p class="text-sm text-slate-500 py-4">Nenhum produto com stock crítico.</p>'}
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                        <h3 class="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">🧾 Últimas Faturas Emitidas</h3>
                        <div class="divide-y divide-slate-100">
                            ${faturas.slice(-5).reverse().map(f => `
                                <div class="py-3 flex justify-between items-center text-sm">
                                    <div>
                                        <span class="font-bold text-slate-800">${f.numero}</span>
                                        <span class="text-xs text-slate-400 block">${f.clienteNome}</span>
                                    </div>
                                    <span class="font-semibold text-emerald-600">${this.formatarKwanza(f.totalGeral)}</span>
                                </div>
                            `).join('') || '<p class="text-sm text-slate-500 py-4">Nenhuma fatura emitida recentemente.</p>'}
                        </div>
                    </div>
                </div>
            `;
        } else if (this.secaoAtual === 'stock') {
            const produtos = DB.carregar('produtos');
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Inventário de Produtos</h3>
                        <p class="text-xs text-slate-500">Gestão de preços e quantidades em tempo real</p>
                    </div>
                    <button onclick="app.modalNovoProduto()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2">
                        <span>+</span> Novo Produto
                    </button>
                </div>
                <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th class="p-4">Código</th>
                                <th class="p-4">Produto</th>
                                <th class="p-4">Preço Custo</th>
                                <th class="p-4">Preço Venda</th>
                                <th class="p-4">Stock</th>
                                <th class="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            ${produtos.map(p => `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 font-semibold text-slate-700">${p.codigo}</td>
                                    <td class="p-4 font-medium text-slate-900">${p.nome}</td>
                                    <td class="p-4 text-slate-600">${this.formatarKwanza(p.precoCusto)}</td>
                                    <td class="p-4 font-bold text-emerald-600">${this.formatarKwanza(p.precoVenda)}</td>
                                    <td class="p-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-bold ${p.stock <= 5 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
                                            ${p.stock} un
                                        </span>
                                    </td>
                                    <td class="p-4 text-right">
                                        <button onclick="app.removerProduto(${p.id})" class="text-slate-400 hover:text-red-600 transition text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (this.secaoAtual === 'faturacao') {
            const produtos = DB.carregar('produtos');
            const clientes = DB.carregar('clientes');

            const subtotal = this.carrinhoVenda.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
            const totalIva = subtotal * 0.14; // IVA 14% Angola
            const totalGeral = subtotal + totalIva;

            container.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Formulário e Seleção -->
                    <div class="lg:col-span-2 space-y-6">
                        <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                            <h3 class="text-base font-bold text-slate-800 mb-4">1. Selecionar Cliente</h3>
                            <select id="venda-cliente" class="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                                ${clientes.map(c => `<option value="${c.id}">${c.nome} (NIF: ${c.nif})</option>`).join('')}
                            </select>
                        </div>

                        <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                            <h3 class="text-base font-bold text-slate-800 mb-4">2. Adicionar Produtos ao POS</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div class="sm:col-span-2">
                                    <select id="venda-produto" class="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                                        ${produtos.map(p => `<option value="${p.id}">${p.nome} — ${this.formatarKwanza(p.precoVenda)} (Stock: ${p.stock})</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <input type="number" id="venda-qtd" min="1" value="1" class="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Qtd">
                                </div>
                            </div>
                            <button onclick="app.adicionarAoCarrinho()" class="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md">
                                + Adicionar item à Fatura
                            </button>
                        </div>

                        <!-- Carrinho de Compras -->
                        <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                            <h3 class="text-base font-bold text-slate-800 mb-4">3. Itens na Fatura Atual</h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr class="border-b border-slate-200 text-xs text-slate-400 uppercase font-bold">
                                            <th class="pb-3">Produto</th>
                                            <th class="pb-3">Qtd</th>
                                            <th class="pb-3">Preço Unit.</th>
                                            <th class="pb-3">Subtotal</th>
                                            <th class="pb-3 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        ${this.carrinhoVenda.map((item, idx) => `
                                            <tr>
                                                <td class="py-3 font-medium text-slate-800">${item.nome}</td>
                                                <td class="py-3 text-slate-600">${item.qtd}</td>
                                                <td class="py-3 text-slate-600">${this.formatarKwanza(item.preco)}</td>
                                                <td class="py-3 font-bold text-emerald-600">${this.formatarKwanza(item.preco * item.qtd)}</td>
                                                <td class="py-3 text-right"><button onclick="app.removerCarrinho(${idx})" class="text-red-500 hover:underline text-xs">Remover</button></td>
                                            </tr>
                                        `).join('') || '<tr><td colspan="5" class="py-4 text-center text-slate-400">Nenhum item adicionado à fatura.</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo e Pagamento -->
                    <div class="space-y-6">
                        <div class="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                            <h3 class="text-base font-bold text-slate-800 mb-4">Resumo da Fatura</h3>
                            <div class="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
                                <div class="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span class="font-semibold">${this.formatarKwanza(subtotal)}</span>
                                </div>
                                <div class="flex justify-between text-slate-600">
                                    <span>IVA (14%):</span>
                                    <span class="font-semibold">${this.formatarKwanza(totalIva)}</span>
                                </div>
                            </div>
                            <div class="flex justify-between text-lg font-bold text-slate-900 mb-6">
                                <span>Total Geral:</span>
                                <span class="text-emerald-600">${this.formatarKwanza(totalGeral)}</span>
                            </div>
                            <button onclick="app.finalizarVenda()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30">
                                Emitir Fatura & Atualizar Stock
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.secaoAtual === 'clientes') {
            const clientes = DB.carregar('clientes');
            container.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Diretório de Clientes</h3>
                        <p class="text-xs text-slate-500">Registo fiscal para faturação</p>
                    </div>
                    <button onclick="app.modalNovoCliente()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2">
                        <span>+</span> Novo Cliente
                    </button>
                </div>
                <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th class="p-4">Nome / Empresa</th>
                                <th class="p-4">NIF</th>
                                <th class="p-4">Contacto</th>
                                <th class="p-4">Morada</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            ${clientes.map(c => `
                                <tr class="hover:bg-slate-50/50 transition">
                                    <td class="p-4 font-semibold text-slate-800">${c.nome}</td>
                                    <td class="p-4 text-slate-600">${c.nif}</td>
                                    <td class="p-4 text-slate-600">${c.telefone}</td>
                                    <td class="p-4 text-slate-600">${c.morada}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    modalNovoProduto() {
        const codigo = prompt("Código do Produto (ex: P003):");
        if (!codigo) return;
        const nome = prompt("Nome do Produto:");
        if (!nome) return;
        const precoCusto = parseFloat(prompt("Preço de Custo em Kwanzas (Kz):") || 0);
        const precoVenda = parseFloat(prompt("Preço de Venda em Kwanzas (Kz):") || 0);
        const stock = parseInt(prompt("Quantidade inicial em Stock:") || 0);

        const produtos = DB.carregar('produtos');
        produtos.push({ id: Date.now(), codigo, nome, precoCusto, precoVenda, stock });
        DB.guardar('produtos', produtos);
        this.renderizarSecao();
    }

    removerProduto(id) {
        if (!confirm("Tem certeza que deseja eliminar este produto?")) return;
        let produtos = DB.carregar('produtos');
        produtos = produtos.filter(p => p.id !== id);
        DB.guardar('produtos', produtos);
        this.renderizarSecao();
    }

    modalNovoCliente() {
        const nome = prompt("Nome do Cliente ou Empresa:");
        if (!nome) return;
        const nif = prompt("NIF (Número de Identificação Fiscal):") || "999999999";
        const telefone = prompt("Telefone de Contacto:") || "+244 900 000 000";
        const morada = prompt("Morada / Localização:") || "Luanda";

        const clientes = DB.carregar('clientes');
        clientes.push({ id: Date.now(), nome, nif, telefone, morada });
        DB.guardar('clientes', clientes);
        this.renderizarSecao();
    }

    adicionarAoCarrinho() {
        const produtoId = parseInt(document.getElementById('venda-produto').value);
        const qtd = parseInt(document.getElementById('venda-qtd').value);
        
        const produtos = DB.carregar('produtos');
        const produto = produtos.find(p => p.id === produtoId);

        if (!produto || qtd <= 0) {
            alert("Selecione um produto válido e quantidade superior a 0.");
            return;
        }

        if (produto.stock < qtd) {
            alert(`Stock insuficiente! Apenas ${produto.stock} unidades disponíveis.`);
            return;
        }

        this.carrinhoVenda.push({
            produtoId: produto.id,
            nome: produto.nome,
            preco: produto.precoVenda,
            qtd: qtd
        });

        this.renderizarSecao();
    }

    removerCarrinho(index) {
        this.carrinhoVenda.splice(index, 1);
        this.renderizarSecao();
    }

    finalizarVenda() {
        if (this.carrinhoVenda.length === 0) {
            alert("O carrinho está vazio.");
            return;
        }

        const clienteId = parseInt(document.getElementById('venda-cliente').value);
        const clientes = DB.carregar('clientes');
        const cliente = clientes.find(c => c.id === clienteId);

        const subtotal = this.carrinhoVenda.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
        const totalIva = subtotal * 0.14;
        const totalGeral = subtotal + totalIva;

        let produtos = DB.carregar('produtos');

        // Sincronizar e baixar o stock
        for (let item of this.carrinhoVenda) {
            const p = produtos.find(prod => prod.id === item.produtoId);
            if (p) {
                p.stock -= item.qtd;
            }
        }
        DB.guardar('produtos', produtos);

        // Guardar Fatura
        const faturas = DB.carregar('faturas');
        const novaFatura = {
            id: Date.now(),
            numero: `FT 2026/${String(faturas.length + 1).padStart(3, '0')}`,
            clienteNome: cliente ? cliente.nome : 'Cliente Consumidor Final',
            itens: [...this.carrinhoVenda],
            subtotal,
            totalIva,
            totalGeral,
            data: new Date().toLocaleDateString('pt-AO')
        };

        faturas.push(novaFatura);
        DB.guardar('faturas', faturas);

        alert(`Fatura ${novaFatura.numero} emitida com sucesso! Stock atualizado automaticamente.`);
        this.carrinhoVenda = [];
        this.mudarSecao('dashboard');
    }
}

const app = new App();
