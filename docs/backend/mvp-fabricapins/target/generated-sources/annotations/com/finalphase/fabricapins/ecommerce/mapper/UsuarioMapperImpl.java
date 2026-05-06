package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Perfil;
import com.finalphase.fabricapins.ecommerce.domain.entities.Usuario;
import com.finalphase.fabricapins.ecommerce.dto.perfil.PerfilMinDTO;
import com.finalphase.fabricapins.ecommerce.dto.usuario.UsuarioDTO;
import com.finalphase.fabricapins.ecommerce.dto.usuario.UsuarioRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UsuarioMapperImpl implements UsuarioMapper {

    @Override
    public UsuarioDTO toDTO(Usuario entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String username = null;
        boolean ativo = false;
        Instant dataCriacao = null;
        List<PerfilMinDTO> perfis = null;

        id = entity.getId();
        username = entity.getUsername();
        ativo = entity.isAtivo();
        dataCriacao = entity.getDataCriacao();
        perfis = perfilListToPerfilMinDTOList( entity.getPerfis() );

        UsuarioDTO usuarioDTO = new UsuarioDTO( id, username, ativo, dataCriacao, perfis );

        return usuarioDTO;
    }

    @Override
    public void updateFromDto(UsuarioRequest dto, Usuario entity) {
        if ( dto == null ) {
            return;
        }

        entity.setUsername( dto.username() );
        entity.setPassword( dto.password() );
        entity.setAtivo( dto.ativo() );
    }

    @Override
    public void partialUpdateFromDto(UsuarioRequest dto, Usuario entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.username() != null ) {
            entity.setUsername( dto.username() );
        }
        if ( dto.password() != null ) {
            entity.setPassword( dto.password() );
        }
        entity.setAtivo( dto.ativo() );
    }

    protected PerfilMinDTO perfilToPerfilMinDTO(Perfil perfil) {
        if ( perfil == null ) {
            return null;
        }

        Long id = null;
        String nome = null;

        id = perfil.getId();
        nome = perfil.getNome();

        PerfilMinDTO perfilMinDTO = new PerfilMinDTO( id, nome );

        return perfilMinDTO;
    }

    protected List<PerfilMinDTO> perfilListToPerfilMinDTOList(List<Perfil> list) {
        if ( list == null ) {
            return null;
        }

        List<PerfilMinDTO> list1 = new ArrayList<PerfilMinDTO>( list.size() );
        for ( Perfil perfil : list ) {
            list1.add( perfilToPerfilMinDTO( perfil ) );
        }

        return list1;
    }
}
