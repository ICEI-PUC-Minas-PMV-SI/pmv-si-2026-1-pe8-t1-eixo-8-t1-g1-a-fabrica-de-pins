package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Endereco;
import com.finalphase.fabricapins.ecommerce.domain.enums.TipoEndereco;
import com.finalphase.fabricapins.ecommerce.dto.endereco.EnderecoDTO;
import com.finalphase.fabricapins.ecommerce.dto.endereco.EnderecoPedidoDTO;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class EnderecoMapperImpl implements EnderecoMapper {

    @Override
    public EnderecoDTO toDTO(Endereco entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String cep = null;
        String estado = null;
        String cidade = null;
        String bairro = null;
        String logradouro = null;
        String numero = null;
        String complemento = null;
        String pontoReferencia = null;
        String observacoes = null;
        boolean enderecoPrincipal = false;
        TipoEndereco tipoEndereco = null;
        String apelido = null;
        Instant dataCadastro = null;

        id = entity.getId();
        cep = entity.getCep();
        estado = entity.getEstado();
        cidade = entity.getCidade();
        bairro = entity.getBairro();
        logradouro = entity.getLogradouro();
        numero = entity.getNumero();
        complemento = entity.getComplemento();
        pontoReferencia = entity.getPontoReferencia();
        observacoes = entity.getObservacoes();
        enderecoPrincipal = entity.isEnderecoPrincipal();
        tipoEndereco = entity.getTipoEndereco();
        apelido = entity.getApelido();
        dataCadastro = entity.getDataCadastro();

        EnderecoDTO enderecoDTO = new EnderecoDTO( id, cep, estado, cidade, bairro, logradouro, numero, complemento, pontoReferencia, observacoes, enderecoPrincipal, tipoEndereco, apelido, dataCadastro );

        return enderecoDTO;
    }

    @Override
    public EnderecoPedidoDTO toEnderecoPedidoDTO(Endereco entity) {
        if ( entity == null ) {
            return null;
        }

        String cep = null;
        String estado = null;
        String cidade = null;
        String bairro = null;
        String logradouro = null;
        String numero = null;
        String complemento = null;
        String pontoReferencia = null;

        cep = entity.getCep();
        estado = entity.getEstado();
        cidade = entity.getCidade();
        bairro = entity.getBairro();
        logradouro = entity.getLogradouro();
        numero = entity.getNumero();
        complemento = entity.getComplemento();
        pontoReferencia = entity.getPontoReferencia();

        EnderecoPedidoDTO enderecoPedidoDTO = new EnderecoPedidoDTO( cep, estado, cidade, bairro, logradouro, numero, complemento, pontoReferencia );

        return enderecoPedidoDTO;
    }

    @Override
    public Endereco toEntity(EnderecoDTO dto) {
        if ( dto == null ) {
            return null;
        }

        String cep = null;
        String estado = null;
        String cidade = null;
        String bairro = null;
        String logradouro = null;
        String numero = null;
        String complemento = null;
        String pontoReferencia = null;
        String observacoes = null;
        TipoEndereco tipoEndereco = null;
        String apelido = null;

        cep = dto.cep();
        estado = dto.estado();
        cidade = dto.cidade();
        bairro = dto.bairro();
        logradouro = dto.logradouro();
        numero = dto.numero();
        complemento = dto.complemento();
        pontoReferencia = dto.pontoReferencia();
        observacoes = dto.observacoes();
        tipoEndereco = dto.tipoEndereco();
        apelido = dto.apelido();

        Endereco endereco = new Endereco( cep, estado, cidade, bairro, logradouro, numero, complemento, pontoReferencia, observacoes, tipoEndereco, apelido );

        endereco.setEnderecoPrincipal( dto.enderecoPrincipal() );

        return endereco;
    }

    @Override
    public void updateFromDto(EnderecoDTO dto, Endereco entity) {
        if ( dto == null ) {
            return;
        }

        entity.setCep( dto.cep() );
        entity.setEstado( dto.estado() );
        entity.setCidade( dto.cidade() );
        entity.setBairro( dto.bairro() );
        entity.setLogradouro( dto.logradouro() );
        entity.setNumero( dto.numero() );
        entity.setComplemento( dto.complemento() );
        entity.setPontoReferencia( dto.pontoReferencia() );
        entity.setObservacoes( dto.observacoes() );
        entity.setEnderecoPrincipal( dto.enderecoPrincipal() );
        entity.setTipoEndereco( dto.tipoEndereco() );
        entity.setApelido( dto.apelido() );
    }

    @Override
    public void partialUpdateFromDto(EnderecoDTO dto, Endereco entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.cep() != null ) {
            entity.setCep( dto.cep() );
        }
        if ( dto.estado() != null ) {
            entity.setEstado( dto.estado() );
        }
        if ( dto.cidade() != null ) {
            entity.setCidade( dto.cidade() );
        }
        if ( dto.bairro() != null ) {
            entity.setBairro( dto.bairro() );
        }
        if ( dto.logradouro() != null ) {
            entity.setLogradouro( dto.logradouro() );
        }
        if ( dto.numero() != null ) {
            entity.setNumero( dto.numero() );
        }
        if ( dto.complemento() != null ) {
            entity.setComplemento( dto.complemento() );
        }
        if ( dto.pontoReferencia() != null ) {
            entity.setPontoReferencia( dto.pontoReferencia() );
        }
        if ( dto.observacoes() != null ) {
            entity.setObservacoes( dto.observacoes() );
        }
        entity.setEnderecoPrincipal( dto.enderecoPrincipal() );
        if ( dto.tipoEndereco() != null ) {
            entity.setTipoEndereco( dto.tipoEndereco() );
        }
        if ( dto.apelido() != null ) {
            entity.setApelido( dto.apelido() );
        }
    }
}
