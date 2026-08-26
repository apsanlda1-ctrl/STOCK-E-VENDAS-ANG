const DB = {
    carregar(chave) {
        const dados = localStorage.getItem(`gestao_${chave}`);
        return dados ? JSON.parse(dados) : this.dadosIniciais(chave);
    },

    guardar(chave, dados) {
        localStorage.setItem(`gestao_${chave}`, JSON.stringify(dados));
    },

    dadosIniciais(chave) {
        const defaults = {
            produtos: [
                { id: 1, codigo: "P001", nome: "Computador Portátil HP", precoCusto: 350000, precoVenda: 480000, stock: 12, iva: 14 },
                { id: 2, codigo: "P002", nome: "Rato Sem Fios Logitech", precoCusto: 8500, precoVenda: 14000, stock: 45, iva: 14 }
            ],
            clientes: [
                { id: 1, nome: "Empresa Exemplo, LDA", nif: "5000000000", telefone: "+244 923 000 000", morada: "Luanda, Talatona" }
            ],
            faturas: []
        };
        return defaults[chave] || [];
    }
};
