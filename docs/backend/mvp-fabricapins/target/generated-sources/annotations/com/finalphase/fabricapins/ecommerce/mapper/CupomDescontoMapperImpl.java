package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.CupomDesconto;
import com.finalphase.fabricapins.ecommerce.domain.enums.TipoDesconto;
import com.finalphase.fabricapins.ecommerce.dto.PedidoCupom.PedidoCupomDTO;
import com.finalphase.fabricapins.ecommerce.dto.cupom_desconto.CupomDescontoDTO;
import com.finalphase.fabricapins.ecommerce.dto.cupom_desconto.CupomDescontoRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CupomDescontoMapperImpl implements CupomDescontoMapper {

    @Override
    public CupomDescontoDTO toDTO(CupomDesconto entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String codigo = null;
        boolean ativo = false;
        BigDecimal valorDesconto = null;
        TipoDesconto tipoDesconto = null;
        LocalDate dataValidade = null;
        Integer quantidadeMinimaItens = null;
        BigDecimal valorMinimoPedido = null;
        Integer limiteUsos = null;

        id = entity.getId();
        codigo = entity.getCodigo();
        ativo = entity.isAtivo();
        valorDesconto = entity.getValorDesconto();
        tipoDesconto = entity.getTipoDesconto();
        dataValidade = entity.getDataValidade();
        quantidadeMinimaItens = entity.getQuantidadeMinimaItens();
        valorMinimoPedido = entity.getValorMinimoPedido();
        limiteUsos = entity.getLimiteUsos();

        Set<PedidoCupomDTO> pedidoCupomSet = null;

        CupomDescontoDTO cupomDescontoDTO = new CupomDescontoDTO( id, codigo, ativo, valorDesconto, tipoDesconto, dataValidade, quantidadeMinimaItens, valorMinimoPedido, limiteUsos, pedidoCupomSet );

        return cupomDescontoDTO;
    }

    @Override
    public CupomDesconto toEntity(CupomDescontoRequest dto) {
        if ( dto == null ) {
            return null;
        }

        CupomDesconto cupomDesconto = new CupomDesconto();

        cupomDesconto.setCodigo( dto.codigo() );
        cupomDesconto.setAtivo( dto.ativo() );
        cupomDesconto.setValorDesconto( dto.valorDesconto() );
        cupomDesconto.setTipoDesconto( dto.tipoDesconto() );
        cupomDesconto.setDataValidade( dto.dataValidade() );
        cupomDesconto.setQuantidadeMinimaItens( dto.quantidadeMinimaItens() );
        cupomDesconto.setValorMinimoPedido( dto.valorMinimoPedido() );
        cupomDesconto.setLimiteUsos( dto.limiteUsos() );

        return cupomDesconto;
    }

    @Override
    public void updateFromDto(CupomDescontoRequest dto, CupomDesconto entity) {
        if ( dto == null ) {
            return;
        }

        entity.setCodigo( dto.codigo() );
        entity.setAtivo( dto.ativo() );
        entity.setValorDesconto( dto.valorDesconto() );
        entity.setTipoDesconto( dto.tipoDesconto() );
        entity.setDataValidade( dto.dataValidade() );
        entity.setQuantidadeMinimaItens( dto.quantidadeMinimaItens() );
        entity.setValorMinimoPedido( dto.valorMinimoPedido() );
        entity.setLimiteUsos( dto.limiteUsos() );
    }

    @Override
    public void partialUpdateFromDto(CupomDescontoRequest dto, CupomDesconto entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.codigo() != null ) {
            entity.setCodigo( dto.codigo() );
        }
        entity.setAtivo( dto.ativo() );
        if ( dto.valorDesconto() != null ) {
            entity.setValorDesconto( dto.valorDesconto() );
        }
        if ( dto.tipoDesconto() != null ) {
            entity.setTipoDesconto( dto.tipoDesconto() );
        }
        if ( dto.dataValidade() != null ) {
            entity.setDataValidade( dto.dataValidade() );
        }
        if ( dto.quantidadeMinimaItens() != null ) {
            entity.setQuantidadeMinimaItens( dto.quantidadeMinimaItens() );
        }
        if ( dto.valorMinimoPedido() != null ) {
            entity.setValorMinimoPedido( dto.valorMinimoPedido() );
        }
        if ( dto.limiteUsos() != null ) {
            entity.setLimiteUsos( dto.limiteUsos() );
        }
    }
}
