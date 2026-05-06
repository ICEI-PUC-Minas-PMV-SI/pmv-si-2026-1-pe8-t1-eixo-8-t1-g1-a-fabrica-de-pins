package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.ItemPedido;
import com.finalphase.fabricapins.ecommerce.domain.entities.ProdutoVariacao;
import com.finalphase.fabricapins.ecommerce.dto.item_pedido.ItemPedidoDTO;
import java.math.BigDecimal;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ItemPedidoMapperImpl implements ItemPedidoMapper {

    @Override
    public ItemPedidoDTO toDTO(ItemPedido entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        Integer quantidade = null;
        BigDecimal precoUnitario = null;
        BigDecimal subTotal = null;

        id = entityProdutoVariacaoId( entity );
        nome = entityProdutoVariacaoNome( entity );
        quantidade = entity.getQuantidade();
        precoUnitario = entity.getPrecoUnitario();
        subTotal = entity.getSubTotal();

        ItemPedidoDTO itemPedidoDTO = new ItemPedidoDTO( id, nome, quantidade, precoUnitario, subTotal );

        return itemPedidoDTO;
    }

    private Long entityProdutoVariacaoId(ItemPedido itemPedido) {
        if ( itemPedido == null ) {
            return null;
        }
        ProdutoVariacao produtoVariacao = itemPedido.getProdutoVariacao();
        if ( produtoVariacao == null ) {
            return null;
        }
        Long id = produtoVariacao.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entityProdutoVariacaoNome(ItemPedido itemPedido) {
        if ( itemPedido == null ) {
            return null;
        }
        ProdutoVariacao produtoVariacao = itemPedido.getProdutoVariacao();
        if ( produtoVariacao == null ) {
            return null;
        }
        String nome = produtoVariacao.getNome();
        if ( nome == null ) {
            return null;
        }
        return nome;
    }
}
