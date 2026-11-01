# Découpe une planche Gemini (objets sur fond blanc) en images séparées.
# Windows PowerShell 5.1, sans dépendance (System.Drawing).
#
#   -src     la planche (jpg ou png)
#   -outDir  dossier de sortie (un PNG par objet, nommé d'après -names)
#   -names   noms des objets, séparés par des virgules, dans l'ordre de
#            lecture de la planche (lignes de haut en bas, puis de gauche à droite)
#   -size    > 0 : image carrée de size px, objet centré, marge de 4 %
#            < 0 : hauteur -size px, largeur proportionnelle, sans marge
#   -seeds   "x,y;x,y" : points du fond enfermés dans un objet (entre la
#            fourche et l'élastique d'un lance-pierre…), rendus transparents aussi
#   -gap     écart minimal (px) entre deux objets ; le baisser si des objets
#            proches restent collés (le log annonce moins d'objets que de noms)
#
# Le fond : les pixels presque blancs reliés au bord de la planche deviennent
# transparents (le blanc à l'intérieur d'un objet, un frigo, reste opaque).
# Vérifier le résultat sur un fond coloré avant de l'intégrer.
param([string]$src, [string]$outDir, [string]$names, [int]$size = 128, [string]$seeds = '', [int]$gap = 30)
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class SheetCutter {
  static bool IsBg(int r, int g, int b) {
    int mn = Math.Min(r, Math.Min(g, b)), mx = Math.Max(r, Math.Max(g, b));
    return mn > 222 && mx - mn < 18;
  }
  public static string Run(string src, string outDir, string[] names, int size, int[][] seeds, int gap) {
    var bmp = new Bitmap(src);
    int W = bmp.Width, H = bmp.Height;
    var data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var px = new int[W * H];
    Marshal.Copy(data.Scan0, px, 0, px.Length);
    bmp.UnlockBits(data);
    // Fond : remplissage depuis les bords (et les points donnés), sur les pixels presque blancs.
    var bg = new bool[W * H];
    var st = new Stack<int>();
    for (int x = 0; x < W; x++) { st.Push(x); st.Push((H - 1) * W + x); }
    for (int y = 0; y < H; y++) { st.Push(y * W); st.Push(y * W + W - 1); }
    foreach (var s in seeds) st.Push(s[1] * W + s[0]);
    while (st.Count > 0) {
      int i = st.Pop();
      if (bg[i]) continue;
      int c = px[i];
      if (!IsBg((c >> 16) & 255, (c >> 8) & 255, c & 255)) continue;
      bg[i] = true;
      int x = i % W, y = i / W;
      if (x > 0) st.Push(i - 1); if (x < W - 1) st.Push(i + 1);
      if (y > 0) st.Push(i - W); if (y < H - 1) st.Push(i + W);
    }
    // Objets : bandes horizontales sans fond, puis bandes verticales dans chacune.
    var rows = Bands(H, W, (a, b) => !bg[a * W + b], gap);
    var log = new System.Text.StringBuilder();
    int n = 0;
    foreach (var r in rows) {
      var cols = Bands(W, r[1] - r[0], (a, b) => !bg[(r[0] + b) * W + a], gap);
      foreach (var c in cols) {
        int x0 = W, y0 = H, x1 = 0, y1 = 0;
        for (int y = r[0]; y < r[1]; y++) for (int x = c[0]; x < c[1]; x++) if (!bg[y * W + x]) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        int w = x1 - x0 + 1, h = y1 - y0 + 1;
        if (w < 20 || h < 20) continue;
        if (n >= names.Length) { log.AppendLine("en trop : " + x0 + "," + y0); continue; }
        var cut = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
          int i = (y0 + y) * W + x0 + x;
          cut.SetPixel(x, y, bg[i] ? Color.FromArgb(0, 255, 255, 255) : Color.FromArgb(px[i] | unchecked((int)0xFF000000)));
        }
        int pad = size > 0 ? (int)Math.Round(size * 0.04) : 0;
        double k = size > 0 ? Math.Min((double)(size - 2 * pad) / w, (double)(size - 2 * pad) / h) : (double)-size / h;
        int dw = (int)Math.Round(w * k), dh = (int)Math.Round(h * k);
        int ow = size > 0 ? size : dw, oh = size > 0 ? size : dh;
        var outBmp = new Bitmap(ow, oh, PixelFormat.Format32bppArgb);
        using (var g = Graphics.FromImage(outBmp)) {
          g.Clear(Color.Transparent);
          g.InterpolationMode = InterpolationMode.HighQualityBicubic;
          g.PixelOffsetMode = PixelOffsetMode.HighQuality;
          g.CompositingQuality = CompositingQuality.HighQuality;
          using (var ia = new ImageAttributes()) {
            ia.SetWrapMode(WrapMode.TileFlipXY);
            g.DrawImage(cut, new Rectangle((ow - dw) / 2, (oh - dh) / 2, dw, dh), 0, 0, w, h, GraphicsUnit.Pixel, ia);
          }
        }
        outBmp.Save(System.IO.Path.Combine(outDir, names[n] + ".png"), ImageFormat.Png);
        log.AppendLine(names[n] + " " + x0 + "," + y0 + " " + w + "x" + h);
        n++;
      }
    }
    log.AppendLine(n + " objet(s) pour " + names.Length + " nom(s)");
    return log.ToString();
  }
  // Intervalles [début, fin) le long d'un axe où il y a un objet, séparés par
  // au moins minGap pixels de fond.
  static List<int[]> Bands(int len, int across, Func<int, int, bool> fg, int minGap) {
    var res = new List<int[]>();
    int start = -1, lastFg = -1;
    for (int a = 0; a < len; a++) {
      bool any = false;
      for (int b = 0; b < across && !any; b++) any = fg(a, b);
      if (any) { if (start < 0) start = a; lastFg = a; }
      else if (start >= 0 && a - lastFg > minGap) { res.Add(new[] { start, lastFg + 1 }); start = -1; }
    }
    if (start >= 0) res.Add(new[] { start, lastFg + 1 });
    return res;
  }
}
'@
$sd = [int[][]]@($seeds.Split(';') | Where-Object { $_ } | ForEach-Object { ,[int[]]($_.Split(',')) })
[SheetCutter]::Run($src, $outDir, $names.Split(','), $size, $sd, $gap)
