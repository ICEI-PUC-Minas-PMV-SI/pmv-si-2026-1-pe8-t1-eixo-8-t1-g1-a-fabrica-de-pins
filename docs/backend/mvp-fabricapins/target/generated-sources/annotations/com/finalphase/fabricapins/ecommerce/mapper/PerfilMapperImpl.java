package com.finalphase.fabricapins.ecommerce.mapper;

import com.finalphase.fabricapins.ecommerce.domain.entities.Perfil;
import com.finalphase.fabricapins.ecommerce.domain.entities.Usuario;
import com.finalphase.fabricapins.ecommerce.dto.perfil.PerfilMinDTO;
import com.finalphase.fabricapins.ecommerce.dto.perfil.PerfilRequest;
import com.finalphase.fabricapins.ecommerce.dto.perfil.PerfilWithUsuariosDTO;
import com.finalphase.fabricapins.ecommerce.dto.usuario.UsuarioMinForPerfilDTO;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-02T20:24:03-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PerfilMapperImpl implements PerfilMapper {

    @Override
    public PerfilMinDTO toMinDTO(Perfil entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;

        id = entity.getId();
        nome = entity.getNome();

        PerfilMinDTO perfilMinDTO = new PerfilMinDTO( id, nome );

        return perfilMinDTO;
    }

    @Override
    public PerfilWithUsuariosDTO toWithUsersDTO(Perfil entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        Set<UsuarioMinForPerfilDTO> usuarios = null;

        id = entity.getId();
        nome = entity.getNome();
        usuarios = usuarioSetToUsuarioMinForPerfilDTOSet( entity.getUsuarios() );

        PerfilWithUsuariosDTO perfilWithUsuariosDTO = new PerfilWithUsuariosDTO( id, nome, usuarios );

        return perfilWithUsuariosDTO;
    }

    @Override
    public Perfil toEntity(PerfilRequest dto) {
        if ( dto == null ) {
            return null;
        }

        Perfil perfil = new Perfil();

        perfil.setNome( dto.nome() );

        return perfil;
    }

    @Override
    public void updateFromDto(PerfilRequest dto, Perfil entity) {
        if ( dto == null ) {
            return;
        }

        entity.setNome( dto.nome() );
    }

    @Override
    public void partialUpdateFromDto(PerfilRequest dto, Perfil entity) {
        if ( dto == null ) {
            return;
        }

        if ( dto.nome() != null ) {
            entity.setNome( dto.nome() );
        }
    }

    protected UsuarioMinForPerfilDTO usuarioToUsuarioMinForPerfilDTO(Usuario usuario) {
        if ( usuario == null ) {
            return null;
        }

        Long id = null;
        String username = null;

        id = usuario.getId();
        username = usuario.getUsername();

        UsuarioMinForPerfilDTO usuarioMinForPerfilDTO = new UsuarioMinForPerfilDTO( id, username );

        return usuarioMinForPerfilDTO;
    }

    protected Set<UsuarioMinForPerfilDTO> usuarioSetToUsuarioMinForPerfilDTOSet(Set<Usuario> set) {
        if ( set == null ) {
            return null;
        }

        Set<UsuarioMinForPerfilDTO> set1 = new LinkedHashSet<UsuarioMinForPerfilDTO>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( Usuario usuario : set ) {
            set1.add( usuarioToUsuarioMinForPerfilDTO( usuario ) );
        }

        return set1;
    }
}
