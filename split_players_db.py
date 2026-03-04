#!/usr/bin/env python3
"""
Script para dividir jugadores_qcf_filtrado_final.json en chunks
optimizados para carga bajo demanda.

Uso:
    python split_players_db.py jugadores_qcf_filtrado_final.json output_dir/

Genera:
    - meta.json (índice maestro)
    - chunks/ (JSONs divididos por rango de ID)
"""

import json
import os
import sys
from pathlib import Path
from collections import defaultdict


def load_players(filepath):
    """Carga el JSON de jugadores"""
    print(f"📂 Cargando {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        players = json.load(f)
    print(f"✅ {len(players):,} jugadores cargados")
    return players


def split_by_id_ranges(players, chunk_size=100000):
    """
    Divide jugadores por rangos de ID.
    
    Args:
        players: dict con IDs como keys
        chunk_size: tamaño del rango (default 100k)
    
    Returns:
        dict de chunks: {range_name: {id: player_data}}
    """
    chunks = defaultdict(dict)
    
    for player_id, player_data in players.items():
        id_num = int(player_id)
        range_start = (id_num // chunk_size) * chunk_size
        range_end = range_start + chunk_size - 1
        range_name = f"{range_start}-{range_end}"
        chunks[range_name][player_id] = player_data
    
    return dict(chunks)


def generate_meta(chunks):
    """
    Genera el archivo meta.json con información de los chunks
    
    Args:
        chunks: dict de chunks generados
    
    Returns:
        dict con metadata
    """
    total_players = sum(len(chunk) for chunk in chunks.values())
    
    ranges = []
    for range_name, chunk_data in sorted(chunks.items()):
        range_start, range_end = map(int, range_name.split('-'))
        ranges.append({
            "min": range_start,
            "max": range_end,
            "file": f"chunks/{range_name}.json",
            "count": len(chunk_data)
        })
    
    return {
        "version": "1.0",
        "totalPlayers": total_players,
        "lastUpdated": "2025-03-04",
        "chunkSize": 100000,
        "ranges": ranges,
        "usage": {
            "example": "Para buscar jugador ID 100011, cargar chunks/100000-199999.json"
        }
    }


def save_chunks(chunks, output_dir):
    """
    Guarda los chunks en el directorio de salida
    
    Args:
        chunks: dict de chunks
        output_dir: directorio donde guardar
    """
    chunks_dir = Path(output_dir) / "chunks"
    chunks_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n💾 Guardando chunks en {chunks_dir}/")
    
    for range_name, chunk_data in sorted(chunks.items()):
        filepath = chunks_dir / f"{range_name}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(chunk_data, f, ensure_ascii=False, indent=2)
        
        size_mb = filepath.stat().st_size / (1024 * 1024)
        print(f"  ✓ {range_name}.json ({len(chunk_data):,} jugadores, {size_mb:.2f} MB)")


def save_meta(meta, output_dir):
    """Guarda el archivo meta.json"""
    filepath = Path(output_dir) / "meta.json"
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Meta guardado: {filepath}")


def generate_stats(players):
    """Genera estadísticas útiles de la base de datos"""
    stats = {
        "total_players": len(players),
        "positions": defaultdict(int),
        "nationalities": defaultdict(int),
        "birth_decades": defaultdict(int),
        "avg_apps": 0,
        "avg_goals": 0
    }
    
    total_apps = 0
    total_goals = 0
    
    for player_data in players.values():
        stats["positions"][player_data.get("p", "UNK")] += 1
        stats["nationalities"][player_data.get("nat", "UNK")] += 1
        
        birth_year = player_data.get("b", "0")
        if birth_year and birth_year.isdigit():
            decade = (int(birth_year) // 10) * 10
            stats["birth_decades"][str(decade)] += 1
        
        total_apps += player_data.get("apps", 0)
        total_goals += player_data.get("goals", 0)
    
    stats["avg_apps"] = round(total_apps / len(players), 1)
    stats["avg_goals"] = round(total_goals / len(players), 1)
    
    # Convertir defaultdict a dict normal para JSON
    stats["positions"] = dict(stats["positions"])
    stats["nationalities"] = dict(sorted(
        stats["nationalities"].items(), 
        key=lambda x: x[1], 
        reverse=True
    )[:20])  # Top 20 nacionalidades
    stats["birth_decades"] = dict(sorted(stats["birth_decades"].items()))
    
    return stats


def main():
    if len(sys.argv) < 3:
        print("Uso: python split_players_db.py <input.json> <output_dir>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    
    # Verificar que existe el archivo
    if not os.path.exists(input_file):
        print(f"❌ Error: No se encuentra {input_file}")
        sys.exit(1)
    
    # Crear directorio de salida
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("🔧 DIVISIÓN DE BASE DE DATOS DE JUGADORES")
    print("=" * 60)
    
    # 1. Cargar jugadores
    players = load_players(input_file)
    
    # 2. Generar estadísticas
    print("\n📊 Generando estadísticas...")
    stats = generate_stats(players)
    print(f"  • Posiciones: {', '.join(f'{k}={v}' for k, v in stats['positions'].items())}")
    print(f"  • Top nacionalidades: {', '.join(list(stats['nationalities'].keys())[:5])}")
    print(f"  • Promedio partidos: {stats['avg_apps']}")
    print(f"  • Promedio goles: {stats['avg_goals']}")
    
    # 3. Dividir por rangos de ID
    print("\n📦 Dividiendo en chunks por rango de ID...")
    chunks = split_by_id_ranges(players, chunk_size=100000)
    print(f"✅ {len(chunks)} chunks creados")
    
    # 4. Generar meta
    print("\n📋 Generando metadata...")
    meta = generate_meta(chunks)
    
    # 5. Guardar todo
    save_chunks(chunks, output_dir)
    save_meta(meta, output_dir)
    
    # 6. Guardar stats
    stats_path = Path(output_dir) / "stats.json"
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"✅ Estadísticas guardadas: {stats_path}")
    
    print("\n" + "=" * 60)
    print("✅ DIVISIÓN COMPLETADA")
    print("=" * 60)
    print(f"\nArchivos generados en: {output_dir}/")
    print("  • meta.json          (índice maestro)")
    print("  • stats.json         (estadísticas)")
    print(f"  • chunks/            ({len(chunks)} archivos JSON)")
    print("\nAhora puedes mover estos archivos a data/players/ en tu proyecto.")


if __name__ == "__main__":
    main()
