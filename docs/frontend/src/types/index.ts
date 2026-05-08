import type {
  CanalAquisicao,
  ModalidadePedido,
  OrderStatus,
} from '@/schemas/order.schema'

export type TipoCliente = 'VAREJO' | 'REVENDA'

export type TipoPessoa = 'FISICA' | 'JURIDICA'

export type CustomerEndereco = {
  cep: string
  estado: string
  cidade: string
  bairro: string
  logradouro: string
  numero: string
  complemento?: string
  pontoReferencia?: string
  observacoes?: string
  enderecoPrincipal: boolean
  tipoEndereco: string
  apelido?: string
}

export type Customer = {
  id: string
  nome: string
  email: string
  telefone: string
  tipoCliente: TipoCliente
  tipoPessoa: TipoPessoa
  /** CPF/CNPJ apenas dígitos */
  documento: string
  ativo: boolean
  enderecos: CustomerEndereco[]
}

export type Category = {
  id: string
  nome: string
  descricao: string
  ativa: boolean
}

export type TipoDescontoCupom = 'PERCENTUAL' | 'FIXO'

export type Cupom = {
  id: string
  codigo: string
  ativo: boolean
  valorDesconto: number
  tipoDesconto: TipoDescontoCupom
  /** ISO date `yyyy-MM-dd` */
  dataValidade: string
  quantidadeMinimaItens: number
  valorMinimoPedido: number
  limiteUsos: number
}

export type Product = {
  id: string
  nome: string
  descricao: string
  tipoEstoque: string
  quantidadeEstoque: number
  estoqueMinimo: number
  precoVarejo: number
  precoRevenda: number
  custoProducao: number
  dataPrevistaLancamento: string
  sku: string
  imgUrl: string
  peso: number
  altura: number
  largura: number
  comprimento: number
  ativo: boolean
  categoriaId: number
  /** Nome amigável (categoria vinda da API ou fallback). */
  categoria: string
  /** Aliases usados em pedidos e tabelas legadas. */
  preco: number
  estoque: number
}

export type OrderItem = {
  produtoId: string
  quantidade: number
  precoUnitario: number
}

export type Order = {
  id: string
  clienteId: string
  clienteNome?: string
  itens: OrderItem[]
  valorTotal: number
  status: OrderStatus
  modalidade: ModalidadePedido
  canalAquisicao: CanalAquisicao
  producaoIniciadaEm?: string
  producaoFinalizadaEm?: string
  createdAt: string
  observacao?: string
  valorFrete?: number
  /** Códigos de cupom aplicados (detalhe GET). */
  cupomCodigos?: string[]
  valorSubtotal?: number
  descontoValor?: number
}

export type { CanalAquisicao, ModalidadePedido, OrderStatus }
