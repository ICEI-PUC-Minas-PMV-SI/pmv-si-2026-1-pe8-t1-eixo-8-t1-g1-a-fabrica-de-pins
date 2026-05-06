package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.ItemPedido;
import com.finalphase.fabricapins.ecommerce.domain.entities.Pedido;
import com.finalphase.fabricapins.ecommerce.domain.enums.OrigemPedido;
import com.finalphase.fabricapins.ecommerce.domain.enums.StatusPedido;
import com.finalphase.fabricapins.ecommerce.dto.PedidoCupom.PedidoCupomDTO;
import com.finalphase.fabricapins.ecommerce.dto.cliente.ClienteMinPedidoDTO;
import com.finalphase.fabricapins.ecommerce.dto.cliente.ClienteSnapshot;
import com.finalphase.fabricapins.ecommerce.dto.endereco.EnderecoPedidoDTO;
import com.finalphase.fabricapins.ecommerce.dto.endereco.EnderecoPedidoRequest;
import com.finalphase.fabricapins.ecommerce.dto.item_pedido.ItemPedidoDTO;
import com.finalphase.fabricapins.ecommerce.dto.pagamento.PagamentoDTO;
import com.finalphase.fabricapins.ecommerce.dto.pedido.PedidoAdminRequest;
import com.finalphase.fabricapins.ecommerce.dto.pedido.PedidoDTO;
import com.finalphase.fabricapins.ecommerce.dto.pedido.PedidoMinDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PedidoMapperImpl implements PedidoMapper {

    @Autowired
    private PagamentoMapper pagamentoMapper;
    @Autowired
    private ItemPedidoMapper itemPedidoMapper;
    @Autowired
    private PedidoCupomMapper pedidoCupomMapper;

    @Override
    public PedidoDTO toDTO(Pedido entity) {
        if ( entity == null ) {
            return null;
        }

        List<ItemPedidoDTO> items = null;
        Long id = null;
        Instant dataCriacao = null;
        Instant dataAtualizacao = null;
        StatusPedido statusPedido = null;
        OrigemPedido origemPedido = null;
        BigDecimal valorTotal = null;
        BigDecimal valorSubtotal = null;
        BigDecimal desconto = null;
        String codigoPedido = null;
        String freteServiceId = null;
        BigDecimal valorFrete = null;
        String nomeServicoFrete = null;
        Integer prazoEntregaDias = null;
        Instant dataInicioProducao = null;
        Instant dataConclusaoPedido = null;
        Instant dataEnvio = null;
        Instant dataEntrega = null;
        String observacao = null;
        PagamentoDTO pagamento = null;
        List<PedidoCupomDTO> cupons = null;

        items = itemPedidoListToItemPedidoDTOList( entity.getItemsPedido() );
        id = entity.getId();
        dataCriacao = entity.getDataCriacao();
        dataAtualizacao = entity.getDataAtualizacao();
        statusPedido = entity.getStatusPedido();
        origemPedido = entity.getOrigemPedido();
        valorTotal = entity.getValorTotal();
        valorSubtotal = entity.getValorSubtotal();
        desconto = entity.getDesconto();
        codigoPedido = entity.getCodigoPedido();
        freteServiceId = entity.getFreteServiceId();
        valorFrete = entity.getValorFrete();
        nomeServicoFrete = entity.getNomeServicoFrete();
        prazoEntregaDias = entity.getPrazoEntregaDias();
        dataInicioProducao = entity.getDataInicioProducao();
        dataConclusaoPedido = entity.getDataConclusaoPedido();
        dataEnvio = entity.getDataEnvio();
        dataEntrega = entity.getDataEntrega();
        observacao = entity.getObservacao();
        pagamento = pagamentoMapper.toDTO( entity.getPagamento() );
        cupons = pedidoCupomMapper.toDTOSet( entity.getCupons() );

        EnderecoPedidoDTO enderecoEntrega = mapEnderecoToDTO(entity);
        ClienteMinPedidoDTO cliente = mapCliente(entity);

        PedidoDTO pedidoDTO = new PedidoDTO( id, dataCriacao, dataAtualizacao, statusPedido, origemPedido, valorTotal, valorSubtotal, desconto, codigoPedido, freteServiceId, valorFrete, nomeServicoFrete, prazoEntregaDias, dataInicioProducao, dataConclusaoPedido, dataEnvio, dataEntrega, cliente, enderecoEntrega, observacao, pagamento, items, cupons );

        return pedidoDTO;
    }

    @Override
    public PedidoMinDTO toMinDTO(Pedido entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        Instant dataCriacao = null;
        StatusPedido statusPedido = null;
        BigDecimal valorTotal = null;
        String codigoPedido = null;

        id = entity.getId();
        dataCriacao = entity.getDataCriacao();
        statusPedido = entity.getStatusPedido();
        valorTotal = entity.getValorTotal();
        codigoPedido = entity.getCodigoPedido();

        PedidoMinDTO pedidoMinDTO = new PedidoMinDTO( id, dataCriacao, statusPedido, valorTotal, codigoPedido );

        return pedidoMinDTO;
    }

    @Override
    public Pedido toEntity(PedidoAdminRequest dto) {
        if ( dto == null ) {
            return null;
        }

        ClienteSnapshot cliente = null;

        Pedido pedido = new Pedido( cliente );

        pedido.setCep( dtoEnderecoEntregaCep( dto ) );
        pedido.setEstado( dtoEnderecoEntregaEstado( dto ) );
        pedido.setCidade( dtoEnderecoEntregaCidade( dto ) );
        pedido.setBairro( dtoEnderecoEntregaBairro( dto ) );
        pedido.setLogradouro( dtoEnderecoEntregaLogradouro( dto ) );
        pedido.setNumero( dtoEnderecoEntregaNumero( dto ) );
        pedido.setComplemento( dtoEnderecoEntregaComplemento( dto ) );
        pedido.setPontoReferencia( dtoEnderecoEntregaPontoReferencia( dto ) );
        pedido.setOrigemPedido( dto.origemPedido() );
        pedido.setObservacao( dto.observacao() );
        pedido.setNomeCliente( dto.nomeCliente() );
        pedido.setDocumentoCliente( dto.documentoCliente() );
        pedido.setTelefone( dto.telefone() );
        pedido.setTipoCliente( dto.tipoCliente() );

        return pedido;
    }

    @Override
    public void updateFromDto(PedidoAdminRequest dto, Pedido entity) {
        if ( dto == null ) {
            return;
        }

        entity.setCep( dtoEnderecoEntregaCep( dto ) );
        entity.setEstado( dtoEnderecoEntregaEstado( dto ) );
        entity.setCidade( dtoEnderecoEntregaCidade( dto ) );
        entity.setBairro( dtoEnderecoEntregaBairro( dto ) );
        entity.setLogradouro( dtoEnderecoEntregaLogradouro( dto ) );
        entity.setNumero( dtoEnderecoEntregaNumero( dto ) );
        entity.setComplemento( dtoEnderecoEntregaComplemento( dto ) );
        entity.setPontoReferencia( dtoEnderecoEntregaPontoReferencia( dto ) );
        entity.setOrigemPedido( dto.origemPedido() );
        entity.setObservacao( dto.observacao() );
        entity.setNomeCliente( dto.nomeCliente() );
        entity.setDocumentoCliente( dto.documentoCliente() );
        entity.setTelefone( dto.telefone() );
        entity.setTipoCliente( dto.tipoCliente() );
    }

    @Override
    public void partialUpdateFromDto(PedidoAdminRequest dto, Pedido entity) {
        if ( dto == null ) {
            return;
        }

        String cep = dtoEnderecoEntregaCep( dto );
        if ( cep != null ) {
            entity.setCep( cep );
        }
        String estado = dtoEnderecoEntregaEstado( dto );
        if ( estado != null ) {
            entity.setEstado( estado );
        }
        String cidade = dtoEnderecoEntregaCidade( dto );
        if ( cidade != null ) {
            entity.setCidade( cidade );
        }
        String bairro = dtoEnderecoEntregaBairro( dto );
        if ( bairro != null ) {
            entity.setBairro( bairro );
        }
        String logradouro = dtoEnderecoEntregaLogradouro( dto );
        if ( logradouro != null ) {
            entity.setLogradouro( logradouro );
        }
        String numero = dtoEnderecoEntregaNumero( dto );
        if ( numero != null ) {
            entity.setNumero( numero );
        }
        String complemento = dtoEnderecoEntregaComplemento( dto );
        if ( complemento != null ) {
            entity.setComplemento( complemento );
        }
        String pontoReferencia = dtoEnderecoEntregaPontoReferencia( dto );
        if ( pontoReferencia != null ) {
            entity.setPontoReferencia( pontoReferencia );
        }
        if ( dto.origemPedido() != null ) {
            entity.setOrigemPedido( dto.origemPedido() );
        }
        if ( dto.observacao() != null ) {
            entity.setObservacao( dto.observacao() );
        }
        if ( dto.nomeCliente() != null ) {
            entity.setNomeCliente( dto.nomeCliente() );
        }
        if ( dto.documentoCliente() != null ) {
            entity.setDocumentoCliente( dto.documentoCliente() );
        }
        if ( dto.telefone() != null ) {
            entity.setTelefone( dto.telefone() );
        }
        if ( dto.tipoCliente() != null ) {
            entity.setTipoCliente( dto.tipoCliente() );
        }
    }

    protected List<ItemPedidoDTO> itemPedidoListToItemPedidoDTOList(List<ItemPedido> list) {
        if ( list == null ) {
            return null;
        }

        List<ItemPedidoDTO> list1 = new ArrayList<ItemPedidoDTO>( list.size() );
        for ( ItemPedido itemPedido : list ) {
            list1.add( itemPedidoMapper.toDTO( itemPedido ) );
        }

        return list1;
    }

    private String dtoEnderecoEntregaCep(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String cep = enderecoEntrega.cep();
        if ( cep == null ) {
            return null;
        }
        return cep;
    }

    private String dtoEnderecoEntregaEstado(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String estado = enderecoEntrega.estado();
        if ( estado == null ) {
            return null;
        }
        return estado;
    }

    private String dtoEnderecoEntregaCidade(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String cidade = enderecoEntrega.cidade();
        if ( cidade == null ) {
            return null;
        }
        return cidade;
    }

    private String dtoEnderecoEntregaBairro(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String bairro = enderecoEntrega.bairro();
        if ( bairro == null ) {
            return null;
        }
        return bairro;
    }

    private String dtoEnderecoEntregaLogradouro(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String logradouro = enderecoEntrega.logradouro();
        if ( logradouro == null ) {
            return null;
        }
        return logradouro;
    }

    private String dtoEnderecoEntregaNumero(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String numero = enderecoEntrega.numero();
        if ( numero == null ) {
            return null;
        }
        return numero;
    }

    private String dtoEnderecoEntregaComplemento(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String complemento = enderecoEntrega.complemento();
        if ( complemento == null ) {
            return null;
        }
        return complemento;
    }

    private String dtoEnderecoEntregaPontoReferencia(PedidoAdminRequest pedidoAdminRequest) {
        if ( pedidoAdminRequest == null ) {
            return null;
        }
        EnderecoPedidoRequest enderecoEntrega = pedidoAdminRequest.enderecoEntrega();
        if ( enderecoEntrega == null ) {
            return null;
        }
        String pontoReferencia = enderecoEntrega.pontoReferencia();
        if ( pontoReferencia == null ) {
            return null;
        }
        return pontoReferencia;
    }
}
