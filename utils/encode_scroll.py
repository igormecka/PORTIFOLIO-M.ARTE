import os
import subprocess

def encode_for_scrubbing(input_file="assets/video/wave.mp4", output_file="assets/video/wave_scrub.mp4"):
    """
    Re-encodes a video so that every frame is a keyframe (-g 1 or keyint=1).
    This is essential for flawless seeking/scrubbing tied to browser scroll without lag.
    It also removes audio (-an) since background videos must be muted.
    """
    if not os.path.exists(input_file):
        print(f"Arquivo não encontrado: {input_file}")
        print("Coloque o seu vídeo original em assets/video/wave.mp4 e rode o script novamente.")
        return
        
    print(f"Otimizando {input_file} para Scroll Mágico (Scrubbing)...")
    
    cmd = [
        "ffmpeg", "-i", input_file,
        "-c:v", "libx264", 
        "-x264-params", "keyint=1", # Força 1 keyframe por frame
        "-an",                      # Remove áudio
        "-y",                       # Sobrescreve
        output_file
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"\n✅ Sucesso! O vídeo otimizado foi salvo em: {output_file}")
        print("Agora, atualize o 'src' da tag <video> no index.html para apontar para wave_scrub.mp4")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Erro no FFmpeg. O ffmpeg está instalado e no seu PATH?\n{e}")
    except FileNotFoundError:
        print("\n❌ FFmpeg não encontrado no sistema. Por favor, instale o ffmpeg (ex: choco install ffmpeg).")

if __name__ == "__main__":
    # Garante que roda da raiz do projeto
    proj_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(proj_root)
    
    # Cria a pasta caso não exista
    if not os.path.exists("assets/video"):
        os.makedirs("assets/video")
        
    encode_for_scrubbing()
