import difflib
import sys

def create_diff(file1, file2, outfile):
    with open(file1, 'r', encoding='utf-8') as f1, open(file2, 'r', encoding='utf-8') as f2:
        lines1 = f1.readlines()
        lines2 = f2.readlines()
    
    diff = difflib.unified_diff(lines1, lines2, fromfile='v114', tofile='v123', n=0)
    with open(outfile, 'w', encoding='utf-8') as out:
        out.writelines(diff)

if __name__ == '__main__':
    create_diff(sys.argv[1], sys.argv[2], sys.argv[3])
