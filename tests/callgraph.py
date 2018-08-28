import subprocess

node_program = 'jcg'

def callgraph(files):
    """Run the primary callgraph generator and return its standard output."""
    program = ['node', node_program, '--cg', *files, '--strategy', 'DEMAND']
    process = subprocess.run(program, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return process.stdout
