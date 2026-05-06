package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Pagamento;
import com.finalphase.fabricapins.ecommerce.domain.enums.FormaPagamento;
import com.finalphase.fabricapins.ecommerce.domain.enums.StatusPagamento;
import com.finalphase.fabricapins.ecommerce.dto.pagamento.PagamentoDTO;
import com.finalphase.fabricapins.ecommerce.dto.pagamento.PagamentoRequest;
import java.math.BigDecimal;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PagamentoMapperImpl implements PagamentoMapper {

    @Override
    public PagamentoDTO toDTO(Pagamento entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        Instant dataPagamento = null;
        BigDecimal valorPago = null;
        FormaPagamento formaPagamento = null;
        StatusPagamento statusPagamento = null;
        String codigoTransacao = null;
        String gatewayPagamento = null;
        Integer parcelasCartao = null;
        Instant dataConfirmacao = null;
        String motivoRecusa = null;

        id = entity.getId();
        dataPagamento = entity.getDataPagamento();
        valorPago = entity.getValorPago();
        formaPagamento = entity.getFormaPagamento();
        statusPagamento = entity.getStatusPagamento();
        codigoTransacao = entity.getCodigoTransacao();
        gatewayPagamento = entity.getGatewayPagamento();
        parcelasCartao = entity.getParcelasCartao();
        dataConfirmacao = entity.getDataConfirmacao();
        motivoRecusa = entity.getMotivoRecusa();

        PagamentoDTO pagamentoDTO = new PagamentoDTO( id, dataPagamento, valorPago, formaPagamento, statusPagamento, codigoTransacao, gatewayPagamento, parcelasCartao, dataConfirmacao, motivoRecusa );

        return pagamentoDTO;
    }

    @Override
    public Pagamento toEntity(PagamentoRequest dto) {
        if ( dto == null ) {
            return null;
        }

        FormaPagamento formaPagamento = null;

        formaPagamento = dto.formaPagamento();

        Pagamento pagamento = new Pagamento( formaPagamento );

        pagamento.setValorPago( dto.valorPago() );
        pagamento.setCodigoTransacao( dto.codigoTransacao() );
        pagamento.setGatewayPagamento( dto.gatewayPagamento() );
        pagamento.setParcelasCartao( dto.parcelasCartao() );

        return pagamento;
    }

    @Override
    public void updateFromDto(PagamentoRequest dto, Pagamento entity) {
        if ( dto == null ) {
            return;
        }

        entity.setValorPago( dto.valorPago() );
        entity.setFormaPagamento( dto.formaPagamento() );
        entity.setCodigoTransacao( dto.codigoTransacao() );
        entity.setGatewayPagamento( dto.gatewayPagamento() );
        entity.setParcelasCartao( dto.parcelasCartao() );
    }

    @Override
    public void partialUpdateFromDto(PagamentoRequest dto, Pagamento entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.valorPago() != null ) {
            entity.setValorPago( dto.valorPago() );
        }
        if ( dto.formaPagamento() != null ) {
            entity.setFormaPagamento( dto.formaPagamento() );
        }
        if ( dto.codigoTransacao() != null ) {
            entity.setCodigoTransacao( dto.codigoTransacao() );
        }
        if ( dto.gatewayPagamento() != null ) {
            entity.setGatewayPagamento( dto.gatewayPagamento() );
        }
        if ( dto.parcelasCartao() != null ) {
            entity.setParcelasCartao( dto.parcelasCartao() );
        }
    }
}
